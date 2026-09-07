import type { PortfolioWorkerEnv, WorkerDependencies } from "./environment.ts";
import { applyResponseSecurityHeaders } from "./security-headers.ts";
import { getSystemStatus } from "./system-status.ts";

const serviceName = "rahul-singh-parmar-portfolio";
const defaultVersion = "v1.0.0";

function responseHeaders(env: PortfolioWorkerEnv, additionalHeaders?: HeadersInit) {
  const headers = new Headers(additionalHeaders);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  return applyResponseSecurityHeaders(headers, env);
}

function jsonResponse(
  env: PortfolioWorkerEnv,
  payload: unknown,
  status = 200,
  additionalHeaders?: HeadersInit,
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders(env, additionalHeaders),
  });
}

function withoutBody(response: Response) {
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function safeVersion(value: string | undefined) {
  return value?.trim().slice(0, 24) || defaultVersion;
}

function methodNotAllowed(env: PortfolioWorkerEnv) {
  return jsonResponse(
    env,
    { error: { code: "method_not_allowed", message: "Only GET and HEAD are supported." } },
    405,
    { Allow: "GET, HEAD" },
  );
}

export async function handleApiRequest(
  request: Request,
  env: PortfolioWorkerEnv,
  dependencies: WorkerDependencies = {},
) {
  const pathname = new URL(request.url).pathname;
  const isHead = request.method === "HEAD";

  if (pathname !== "/api/health" && pathname !== "/api/system-status") {
    const response = jsonResponse(
      env,
      { error: { code: "not_found", message: "API route not found." } },
      404,
    );
    return isHead ? withoutBody(response) : response;
  }

  if (request.method !== "GET" && !isHead) return methodNotAllowed(env);

  if (pathname === "/api/health") {
    const now = dependencies.now ?? (() => new Date());
    const response = jsonResponse(env, {
      status: "ok",
      service: serviceName,
      version: safeVersion(env.SITE_VERSION),
      timestamp: now().toISOString(),
      runtime: "cloudflare-workers",
    });
    return isHead ? withoutBody(response) : response;
  }

  const response = jsonResponse(env, await getSystemStatus(env, dependencies));
  return isHead ? withoutBody(response) : response;
}

const worker = {
  async fetch(request: Request, env: PortfolioWorkerEnv) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return handleApiRequest(request, env);
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);

    return new Response("Static asset binding unavailable.", {
      status: 404,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};

export default worker;
