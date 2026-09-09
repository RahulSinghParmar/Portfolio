import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";

import worker from "../worker/index.ts";

const outputRoot = resolve(process.cwd(), "out");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "3100", 10);
const workerEnv = {
  SITE_VERSION: process.env.SITE_VERSION,
  SYSTEM_STATUS_SOURCE: process.env.SYSTEM_STATUS_SOURCE,
  SYSTEM_STATUS_URL: process.env.SYSTEM_STATUS_URL,
  SYSTEM_STATUS_TOKEN: process.env.SYSTEM_STATUS_TOKEN,
  SYSTEM_STATUS_TIMEOUT_MS: process.env.SYSTEM_STATUS_TIMEOUT_MS,
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const extensionlessTypes = new Map([
  ["apple-icon", "image/png"],
  ["icon", "image/png"],
  ["opengraph-image", "image/png"],
  ["twitter-image", "image/png"],
]);

function resolveRequest(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const requestPath = decoded.replace(/^\/+/, "");
  const candidates = requestPath
    ? [requestPath, `${requestPath}.html`, join(requestPath, "index.html")]
    : ["index.html"];

  for (const candidate of candidates) {
    const absolute = resolve(outputRoot, candidate);
    const insideRoot = relative(outputRoot, absolute);
    if (insideRoot === ".." || insideRoot.startsWith(`..${sep}`)) continue;
    if (existsSync(absolute) && statSync(absolute).isFile()) return absolute;
  }

  return null;
}

if (!existsSync(join(outputRoot, "index.html"))) {
  console.error("Static preview requires out/index.html. Run `npm run build` first.");
  process.exit(1);
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);

  if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/")) {
    try {
      const workerResponse = await worker.fetch(
        new Request(requestUrl, { method: request.method }),
        workerEnv,
      );
      response.writeHead(workerResponse.status, Object.fromEntries(workerResponse.headers));
      if (request.method === "HEAD") {
        response.end();
      } else {
        response.end(Buffer.from(await workerResponse.arrayBuffer()));
      }
    } catch {
      response.writeHead(500, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end('{"error":{"code":"preview_error","message":"Local preview failed."}}');
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method Not Allowed");
    return;
  }

  const requestedFile = resolveRequest(requestUrl.pathname);
  const file = requestedFile ?? join(outputRoot, "404.html");
  const name = relative(outputRoot, file).replaceAll("\\", "/");
  const type = extensionlessTypes.get(name) ?? contentTypes[extname(file).toLowerCase()];

  response.writeHead(requestedFile ? 200 : 404, {
    "Cache-Control": "no-store",
    "Content-Type": type ?? "application/octet-stream",
  });
  if (request.method === "HEAD") {
    response.end();
  } else {
    createReadStream(file).pipe(response);
  }
});

server.listen(port, host, () => {
  console.log(`Static export available at http://${host}:${port}`);
  console.log("API Worker adapter is enabled for /api/*.");
});
