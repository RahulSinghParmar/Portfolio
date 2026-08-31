const baseUrl = new URL(process.argv[2] ?? process.env.DEPLOYMENT_URL ?? "http://localhost:3100");
const expectedTitle = "Rahul Singh Parmar — Team Lead Network Engineer";

const checks = [];
const failures = [];

function check(label, condition, detail) {
  checks.push({ label, status: condition ? "PASS" : "FAIL" });
  if (!condition) failures.push(detail ?? label);
}

async function request(path, expectedType) {
  const url = new URL(path, baseUrl);
  try {
    const response = await fetch(url, {
      headers: { Accept: expectedType },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    return { url, response, body: await response.text() };
  } catch (error) {
    failures.push(`${url}: ${error instanceof Error ? error.message : "request failed"}`);
    return null;
  }
}

const home = await request("/", "text/html");
check(
  "home status",
  home?.response.status === 200,
  `home returned ${home?.response.status ?? "none"}`,
);
check("home title", home?.body.includes(`<title>${expectedTitle}</title>`) === true);
check(
  "canonical production URL",
  home?.body.includes('rel="canonical" href="https://rahulsinghparmar.site"') === true,
);

const securityHeaders = {
  "content-security-policy": "default-src 'self'",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
};

for (const [header, expectedValue] of Object.entries(securityHeaders)) {
  const value = home?.response.headers.get(header);
  check(
    `security header ${header}`,
    Boolean(value?.includes(expectedValue)),
    `${header}: ${value}`,
  );
}

const health = await request("/api/health", "application/json");
let healthPayload;
try {
  healthPayload = health ? JSON.parse(health.body) : null;
} catch {
  healthPayload = null;
}

check("health status", health?.response.status === 200);
check("health payload", healthPayload?.status === "ok");
check("health service identity", healthPayload?.service === "rahul-singh-parmar-portfolio");
check("health no-store", health?.response.headers.get("cache-control") === "no-store");

const routes = [
  ["/robots.txt", "text/plain", "Sitemap: https://rahulsinghparmar.site/sitemap.xml"],
  ["/sitemap.xml", "application/xml", "https://rahulsinghparmar.site"],
  ["/manifest.webmanifest", "application/manifest+json", '"short_name":"RSP Portfolio"'],
  ["/opengraph-image", "image/png", null],
  ["/twitter-image", "image/png", null],
  ["/icon", "image/png", null],
];

for (const [path, expectedType, expectedBody] of routes) {
  const result = await request(path, expectedType);
  check(`${path} status`, result?.response.status === 200);
  check(
    `${path} content type`,
    result?.response.headers.get("content-type")?.includes(expectedType) === true,
  );
  if (expectedBody) check(`${path} contract`, result?.body.includes(expectedBody) === true);
}

console.log(`\nDeployment contract: ${baseUrl}\n`);
console.table(checks);

if (failures.length > 0 || checks.some((entry) => entry.status === "FAIL")) {
  console.error("\nDeployment contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Deployment contract passed.");
}
