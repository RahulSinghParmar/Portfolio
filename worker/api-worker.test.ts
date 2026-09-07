import assert from "node:assert/strict";
import test from "node:test";

import worker, { handleApiRequest } from "./index.ts";
import {
  getSystemStatus,
  normalizeStatusPayload,
  resolveStatusConfiguration,
} from "./system-status.ts";

const fixedDate = new Date("2026-09-07T12:00:00.000Z");
const now = () => fixedDate;

test("disabled status source is explicit and does not fetch", async () => {
  let requests = 0;
  const result = await getSystemStatus(
    { SITE_VERSION: "v1.1.0", SYSTEM_STATUS_SOURCE: "disabled" },
    {
      fetch: async () => {
        requests += 1;
        throw new Error("unexpected request");
      },
      now,
    },
  );

  assert.equal(requests, 0);
  assert.deepEqual(result, {
    version: "v1.1.0",
    responseTimeMs: null,
    uptimePercent: null,
    region: null,
    services: [],
    state: "pending",
    status: "Status source not connected",
    checkedAt: null,
    source: "disconnected",
  });
});

test("configured source uses only the bound URL and protects authorization on redirects", async () => {
  let requestedUrl = "";
  let requestInit: RequestInit | undefined;
  const result = await getSystemStatus(
    {
      SITE_VERSION: "v1.1.0",
      SYSTEM_STATUS_SOURCE: "http",
      SYSTEM_STATUS_URL: "https://status.example.test/internal?format=public",
      SYSTEM_STATUS_TOKEN: "test-secret",
      SYSTEM_STATUS_TIMEOUT_MS: "4000",
    },
    {
      fetch: async (input, init) => {
        requestedUrl = input.toString();
        requestInit = init;
        return Response.json(
          {
            status: "healthy",
            version: "monitor-7",
            checkedAt: "2026-09-07T11:59:00Z",
            uptimePercent: 99.95,
            region: "apac",
            services: [
              { name: "Dashboard", status: "up", responseTimeMs: 20 },
              { name: "Cloud", status: "operational", responseTime: "40 ms" },
            ],
          },
          { headers: { "Content-Type": "application/json" } },
        );
      },
      now,
    },
  );

  assert.equal(requestedUrl, "https://status.example.test/internal?format=public");
  assert.equal(requestInit?.redirect, "manual");
  assert.equal(new Headers(requestInit?.headers).get("Authorization"), "Bearer test-secret");
  assert.equal(result.state, "operational");
  assert.equal(result.source, "live");
  assert.equal(result.responseTimeMs, 30);
  assert.equal(result.uptimePercent, 99.95);
  assert.equal(result.services.length, 2);
});

test("service states retain degraded, unavailable, and unknown behavior", () => {
  const degraded = normalizeStatusPayload(
    {
      services: [
        { name: "A", state: "up" },
        { name: "B", state: "warning" },
      ],
    },
    "v1",
  );
  const unavailable = normalizeStatusPayload(
    {
      services: [
        { name: "A", state: "up" },
        { name: "B", state: "down" },
      ],
    },
    "v1",
  );
  const unknown = normalizeStatusPayload({ status: "indeterminate" }, "v1");

  assert.equal(degraded.state, "degraded");
  assert.equal(unavailable.state, "unavailable");
  assert.equal(unknown.state, "unknown");
});

test("normalization bounds public fields and service count", () => {
  const services = Array.from({ length: 15 }, (_, index) => ({
    name: `service-${index}-${"x".repeat(60)}`,
    status: "up",
    responseTimeMs: index === 0 ? -1 : index,
  }));
  const result = normalizeStatusPayload(
    { services, uptimePercent: 150, region: "r".repeat(80) },
    "v1",
  );

  assert.equal(result.services.length, 12);
  assert.equal(result.services[0].name.length, 48);
  assert.equal(result.services[0].responseTimeMs, null);
  assert.equal(result.uptimePercent, null);
  assert.equal(result.region?.length, 40);
});

test("invalid source configuration fails closed without fetching", async () => {
  let requests = 0;
  const result = await getSystemStatus(
    {
      SYSTEM_STATUS_SOURCE: "http",
      SYSTEM_STATUS_URL: "http://127.0.0.1/private",
    },
    {
      fetch: async () => {
        requests += 1;
        return Response.json({ status: "up" });
      },
      now,
    },
  );

  assert.equal(requests, 0);
  assert.equal(result.state, "unavailable");
  assert.equal(result.source, "unavailable");
  assert.equal(result.checkedAt, fixedDate.toISOString());
  assert.doesNotMatch(JSON.stringify(result), /127\.0\.0\.1|private/);
});

test("timeouts are clamped to one through eight seconds", () => {
  const low = resolveStatusConfiguration({
    SYSTEM_STATUS_SOURCE: "http",
    SYSTEM_STATUS_URL: "https://status.example.test/",
    SYSTEM_STATUS_TIMEOUT_MS: "1",
  });
  const high = resolveStatusConfiguration({
    SYSTEM_STATUS_SOURCE: "http",
    SYSTEM_STATUS_URL: "https://status.example.test/",
    SYSTEM_STATUS_TIMEOUT_MS: "90000",
  });

  assert.equal(low.mode === "http" && low.timeoutMs, 1000);
  assert.equal(high.mode === "http" && high.timeoutMs, 8000);
});

test("a stalled upstream request is aborted at the configured timeout", async () => {
  const startedAt = Date.now();
  const result = await getSystemStatus(
    {
      SYSTEM_STATUS_SOURCE: "http",
      SYSTEM_STATUS_URL: "https://status.example.test/",
      SYSTEM_STATUS_TIMEOUT_MS: "1000",
    },
    {
      fetch: (_input, init) =>
        new Promise((resolve, reject) => {
          const stalledRequest = setTimeout(() => resolve(Response.json({ status: "up" })), 3000);
          init?.signal?.addEventListener(
            "abort",
            () => {
              clearTimeout(stalledRequest);
              reject(init.signal?.reason);
            },
            { once: true },
          );
        }),
      now,
    },
  );

  assert.equal(result.state, "unavailable");
  assert.ok(Date.now() - startedAt >= 900);
  assert.ok(Date.now() - startedAt < 3000);
});

for (const [name, response] of [
  ["redirect", new Response(null, { status: 302, headers: { Location: "https://other.test" } })],
  ["wrong content type", new Response("{}", { headers: { "Content-Type": "text/html" } })],
  ["invalid JSON", new Response("not-json", { headers: { "Content-Type": "application/json" } })],
] as const) {
  test(`${name} source response returns a safe unavailable state`, async () => {
    const result = await getSystemStatus(
      { SYSTEM_STATUS_SOURCE: "http", SYSTEM_STATUS_URL: "https://status.example.test/" },
      { fetch: async () => response.clone(), now },
    );

    assert.equal(result.state, "unavailable");
    assert.equal(result.status, "Status source temporarily unavailable");
    assert.equal(result.source, "unavailable");
  });
}

test("source bodies are capped even without a content-length header", async () => {
  const oversizedBody = `{"padding":"${"x".repeat(70 * 1024)}"}`;
  const result = await getSystemStatus(
    { SYSTEM_STATUS_SOURCE: "http", SYSTEM_STATUS_URL: "https://status.example.test/" },
    {
      fetch: async () =>
        new Response(oversizedBody, { headers: { "Content-Type": "application/json" } }),
      now,
    },
  );

  assert.equal(result.state, "unavailable");
  assert.equal(result.source, "unavailable");
});

test("health response identifies edge runtime without process uptime", async () => {
  const response = await handleApiRequest(
    new Request("https://portfolio.test/api/health"),
    { SITE_VERSION: "v1.1.0" },
    { now },
  );
  const payload = (await response.json()) as Record<string, unknown>;

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(response.headers.get("Content-Security-Policy") ?? "", /default-src 'self'/);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(payload.runtime, "cloudflare-workers");
  assert.equal(payload.version, "v1.1.0");
  assert.equal(payload.timestamp, fixedDate.toISOString());
  assert.equal("uptimeSeconds" in payload, false);
});

test("production API responses do not inherit preview noindex headers", async () => {
  const response = await handleApiRequest(
    new Request("https://portfolio.test/api/health"),
    { DEPLOYMENT_ENV: "production" },
    { now },
  );

  assert.equal(response.headers.get("X-Robots-Tag"), null);
});

test("HEAD, method rejection, and unknown API routes have deliberate contracts", async () => {
  const head = await handleApiRequest(
    new Request("https://portfolio.test/api/system-status", { method: "HEAD" }),
    {},
    { now },
  );
  const method = await handleApiRequest(
    new Request("https://portfolio.test/api/system-status", { method: "POST" }),
    {},
    { now },
  );
  const missing = await handleApiRequest(
    new Request("https://portfolio.test/api/not-real"),
    {},
    { now },
  );

  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("Allow"), "GET, HEAD");
  assert.equal((await method.json()).error.code, "method_not_allowed");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, "not_found");
});

test("non-API paths delegate to the static asset binding", async () => {
  let delegatedUrl = "";
  const response = await worker.fetch(new Request("https://portfolio.test/not-real"), {
    ASSETS: {
      fetch: async (request) => {
        delegatedUrl = request.url;
        return new Response("custom 404", {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  });

  assert.equal(delegatedUrl, "https://portfolio.test/not-real");
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "custom 404");
});

test("missing asset binding fails closed outside the API namespace", async () => {
  const response = await worker.fetch(new Request("https://portfolio.test/"), {});
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Static asset binding unavailable.");
});
