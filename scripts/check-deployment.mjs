const baseUrl = new URL(process.argv[2] ?? process.env.DEPLOYMENT_URL ?? "http://127.0.0.1:8788");
const expectedEnvironment =
  process.env.DEPLOYMENT_EXPECTED_ENV ??
  (baseUrl.hostname.endsWith(".workers.dev")
    ? "preview"
    : baseUrl.hostname === "rahulsinghparmar.site"
      ? "production"
      : "local");
const expectedTitle = "Rahul Singh Parmar — DCO Tech 3";
const checks = [];
const failures = [];

function check(label, condition, detail = label) {
  checks.push({ label, status: condition ? "PASS" : "FAIL" });
  if (!condition) failures.push(detail);
}

async function request(pathname, options = {}) {
  const url = new URL(pathname, baseUrl);
  try {
    const response = await fetch(url, {
      headers: { Accept: options.accept ?? "*/*", ...options.headers },
      method: options.method ?? "GET",
      redirect: options.redirect ?? "follow",
      signal: AbortSignal.timeout(options.timeout ?? 10_000),
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { response, bytes, body: new TextDecoder().decode(bytes) };
  } catch (error) {
    failures.push(`${url}: ${error instanceof Error ? error.message : "request failed"}`);
    return null;
  }
}

function hasSecurityHeaders(result, prefix) {
  const required = {
    "content-security-policy": "default-src 'self'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=()",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
  };
  for (const [name, expected] of Object.entries(required)) {
    const value = result?.response.headers.get(name);
    check(`${prefix} ${name}`, Boolean(value?.includes(expected)), `${name}: ${value}`);
  }
}

const home = await request("/", { accept: "text/html" });
check("home status", home?.response.status === 200, `home returned ${home?.response.status}`);
check("home HTML", home?.response.headers.get("content-type")?.includes("text/html") === true);
check("home title", home?.body.includes(`<title>${expectedTitle}</title>`) === true);
check(
  "canonical production URL",
  home?.body.includes('rel="canonical" href="https://rahulsinghparmar.site"') === true,
);
check(
  "home revalidates",
  home?.response.headers.get("cache-control")?.includes("max-age=0") === true &&
    !home?.response.headers.get("cache-control")?.includes("immutable"),
  `home cache-control: ${home?.response.headers.get("cache-control")}`,
);
hasSecurityHeaders(home, "static");
check(
  "preview is noindex",
  expectedEnvironment !== "preview" ||
    home?.response.headers.get("x-robots-tag")?.includes("noindex") === true,
  `preview x-robots-tag: ${home?.response.headers.get("x-robots-tag")}`,
);
check(
  "production is indexable",
  expectedEnvironment !== "production" || !home?.response.headers.has("x-robots-tag"),
  `production x-robots-tag: ${home?.response.headers.get("x-robots-tag")}`,
);

const headHome = await request("/", { method: "HEAD", accept: "text/html" });
check("home HEAD status", headHome?.response.status === 200);
check("home HEAD body empty", headHome?.bytes.length === 0);

const health = await request("/api/health", {
  accept: "application/json",
  headers: { "Sec-Fetch-Mode": "navigate" },
});
let healthPayload;
try {
  healthPayload = JSON.parse(health?.body ?? "");
} catch {
  healthPayload = null;
}
check("health status", health?.response.status === 200);
check(
  "health JSON",
  health?.response.headers.get("content-type")?.includes("application/json") === true,
);
check("health payload", healthPayload?.status === "ok");
check("health service identity", healthPayload?.service === "rahul-singh-parmar-portfolio");
check("health Worker runtime", healthPayload?.runtime === "cloudflare-workers");
check(
  "health version",
  typeof healthPayload?.version === "string" && healthPayload.version.length > 0,
);
check("health has no process uptime", !("uptimeSeconds" in (healthPayload ?? {})));
check("health no-store", health?.response.headers.get("cache-control") === "no-store");
hasSecurityHeaders(health, "API");

const healthHead = await request("/api/health", { method: "HEAD" });
check("health HEAD status", healthHead?.response.status === 200);
check("health HEAD body empty", healthHead?.bytes.length === 0);

const status = await request("/api/system-status", { accept: "application/json" });
let statusPayload;
try {
  statusPayload = JSON.parse(status?.body ?? "");
} catch {
  statusPayload = null;
}
check("status endpoint status", status?.response.status === 200);
check(
  "status state contract",
  ["pending", "operational", "degraded", "unavailable"].includes(statusPayload?.state),
);
check(
  "status source contract",
  ["disconnected", "live", "unavailable"].includes(statusPayload?.source),
);
check(
  "status services bounded",
  Array.isArray(statusPayload?.services) && statusPayload.services.length <= 12,
);
check("status no-store", status?.response.headers.get("cache-control") === "no-store");

const unknownApi = await request("/api/does-not-exist", { accept: "application/json" });
let unknownPayload;
try {
  unknownPayload = JSON.parse(unknownApi?.body ?? "");
} catch {
  unknownPayload = null;
}
check(
  "unknown API is 404 JSON",
  unknownApi?.response.status === 404 && unknownPayload?.error?.code === "not_found",
);

const unsupportedMethod = await request("/api/health", { method: "POST" });
check("unsupported API method", unsupportedMethod?.response.status === 405);
check("unsupported API Allow", unsupportedMethod?.response.headers.get("allow") === "GET, HEAD");

const missingPage = await request("/release-check-missing-page", { accept: "text/html" });
check("missing page is genuine 404", missingPage?.response.status === 404);
check(
  "missing page is HTML",
  missingPage?.response.headers.get("content-type")?.includes("text/html") === true,
);
hasSecurityHeaders(missingPage, "404");

const routes = [
  ["/robots.txt", "text/plain", "Sitemap: https://rahulsinghparmar.site/sitemap.xml"],
  ["/sitemap.xml", "application/xml", "https://rahulsinghparmar.site"],
  ["/manifest.webmanifest", "application/manifest+json", '"short_name":"RSP Portfolio"'],
  ["/opengraph-image.png", "image/png", null],
  ["/twitter-image.png", "image/png", null],
  ["/icon.png", "image/png", null],
  ["/apple-icon.png", "image/png", null],
];

for (const [pathname, expectedType, expectedBody] of routes) {
  const result = await request(pathname, { accept: expectedType });
  check(`${pathname} status`, result?.response.status === 200);
  check(
    `${pathname} content type`,
    result?.response.headers.get("content-type")?.includes(expectedType) === true,
    `${pathname} content-type: ${result?.response.headers.get("content-type")}`,
  );
  if (expectedBody) check(`${pathname} contract`, result?.body.includes(expectedBody) === true);
}

const cssPath = home?.body.match(/href="([^\"]+\.css)"/)?.[1];
check("hashed stylesheet discovered", Boolean(cssPath), "no stylesheet link found in home HTML");
if (cssPath) {
  const stylesheet = await request(cssPath, { accept: "text/css" });
  check("stylesheet status", stylesheet?.response.status === 200);
  check(
    "stylesheet immutable cache",
    stylesheet?.response.headers.get("cache-control")?.includes("max-age=31536000") === true &&
      stylesheet?.response.headers.get("cache-control")?.includes("immutable") === true,
    `stylesheet cache-control: ${stylesheet?.response.headers.get("cache-control")}`,
  );
}

const portrait = await request("/images/rahul.webp", { accept: "image/webp" });
check("portrait status", portrait?.response.status === 200);
check(
  "portrait MIME",
  portrait?.response.headers.get("content-type")?.includes("image/webp") === true,
);
check(
  "portrait bounded cache",
  portrait?.response.headers.get("cache-control")?.includes("max-age=86400") === true &&
    !portrait?.response.headers.get("cache-control")?.includes("immutable"),
  `portrait cache-control: ${portrait?.response.headers.get("cache-control")}`,
);

console.log(`\nDeployment contract: ${baseUrl} (${expectedEnvironment})\n`);
console.table(checks);

if (failures.length > 0 || checks.some((entry) => entry.status === "FAIL")) {
  console.error("\nDeployment contract failed:");
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Deployment contract passed (${checks.length} checks).`);
}
