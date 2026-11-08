import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputRoot = path.join(root, "out");
const content = JSON.parse(await readFile(path.join(root, "content/portfolio.json"), "utf8"));

const files = {
  home: path.join(outputRoot, "index.html"),
  notFound: path.join(outputRoot, "404.html"),
  robots: path.join(outputRoot, "robots.txt"),
  sitemap: path.join(outputRoot, "sitemap.xml"),
  manifest: path.join(outputRoot, "manifest.webmanifest"),
};

const expected = {
  canonical: (process.env.NEXT_PUBLIC_SITE_URL ?? content.profile.siteUrl).replace(/\/$/, ""),
  title: `${content.profile.name} — ${content.profile.role}${content.profile.employerShort ? ` at ${content.profile.employerShort}` : ""}`,
  role: content.profile.role,
  employer: content.profile.employer,
  email: content.profile.email,
  language: content.seo.language,
  twitterCreator: content.seo.twitterHandle,
};

const read = async (file) => {
  try {
    return await readFile(file, "utf8");
  } catch {
    throw new Error(`Missing build output: ${path.relative(root, file)}. Run npm run build first.`);
  }
};

const [home, notFound, robots, sitemap, manifestSource] = await Promise.all(
  Object.values(files).map(read),
);

const failures = [];
const checks = [];

function check(label, condition, detail) {
  checks.push({ label, status: condition ? "PASS" : "FAIL" });
  if (!condition) failures.push(detail ?? label);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function metaContent(key, value) {
  const tag = home.match(new RegExp(`<meta[^>]+${key}="${escapeRegExp(value)}"[^>]*>`, "i"))?.[0];
  return tag?.match(/content="([^"]*)"/i)?.[1] ?? null;
}

const title = home.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null;
const description = metaContent("name", "description");
const canonical = home.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"[^>]*>/i)?.[1] ?? null;

check("document language", home.includes(`<html lang="${expected.language}"`), expected.language);
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
check("canonical title", title === escapeHtml(expected.title), title ?? "missing title");
check(
  "search description",
  Boolean(description && description.length >= 50 && description.length <= 200),
  description ?? "missing description",
);
check("single canonical URL", canonical === expected.canonical, canonical ?? "missing canonical");
check(
  "one canonical tag",
  countMatches(home, /rel="canonical"/gi) === 1,
  "duplicate canonical tags",
);
check("indexable home route", metaContent("name", "robots") === "index, follow");
check("non-indexable 404", metaContentFrom(notFound, "name", "robots") === "noindex");

function metaContentFrom(source, key, value) {
  const tag = source.match(new RegExp(`<meta[^>]+${key}="${escapeRegExp(value)}"[^>]*>`, "i"))?.[0];
  return tag?.match(/content="([^"]*)"/i)?.[1] ?? null;
}

const openGraphRequirements = {
  "og:type": "profile",
  "og:url": expected.canonical,
  "og:image:type": "image/png",
  "og:image:width": "1200",
  "og:image:height": "630",
};

for (const [property, value] of Object.entries(openGraphRequirements)) {
  check(`Open Graph ${property}`, metaContent("property", property) === value);
}

check(
  "Open Graph image",
  Boolean(metaContent("property", "og:image")?.endsWith("/opengraph-image.png")),
);
check("Open Graph image alt", Boolean(metaContent("property", "og:image:alt")));
check("Twitter large card", metaContent("name", "twitter:card") === "summary_large_image");
check("Twitter creator", metaContent("name", "twitter:creator") === expected.twitterCreator);
check(
  "Twitter image",
  Boolean(metaContent("name", "twitter:image")?.endsWith("/twitter-image.png")),
);
check("Twitter image alt", Boolean(metaContent("name", "twitter:image:alt")));
check("web manifest link", home.includes('rel="manifest" href="/manifest.webmanifest"'));
check("64px browser icon", home.includes('type="image/png" sizes="64x64"'));
check(
  "180px Apple icon",
  home.includes('rel="apple-touch-icon"') && home.includes('sizes="180x180"'),
);

const jsonLdSource = home.match(
  /<script id="profile-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/i,
)?.[1];

let structuredData;
try {
  structuredData = jsonLdSource ? JSON.parse(jsonLdSource) : null;
} catch {
  failures.push("structured data is not valid JSON");
}

const graph = Array.isArray(structuredData?.["@graph"]) ? structuredData["@graph"] : [];
const graphTypes = new Set(graph.map((entry) => entry["@type"]));

for (const type of ["Person", "WebSite", "ProfilePage", "ItemList"]) {
  check(`structured data ${type}`, graphTypes.has(type));
}

const person = graph.find((entry) => entry["@type"] === "Person");
const work = graph.find((entry) => entry["@type"] === "ItemList");
check(
  "configured social identities",
  Array.isArray(person?.sameAs) &&
    person.sameAs.length === content.contactChannels.filter((channel) => channel.identity).length,
);
check("current professional role", person?.jobTitle === expected.role);
check("current organization", person?.worksFor?.name === expected.employer);
check("confirmed public email", person?.email === expected.email);
check(
  "selected project count",
  work?.numberOfItems === content.projects.length &&
    work?.itemListElement?.length === content.projects.length,
);

check("robots allows portfolio", robots.includes("Allow: /"));
check("robots blocks API", robots.includes("Disallow: /api/"));
check("robots declares sitemap", robots.includes(`Sitemap: ${expected.canonical}/sitemap.xml`));
check("sitemap canonical URL", sitemap.includes(`<loc>${expected.canonical}</loc>`));
check(
  "sitemap profile image",
  sitemap.includes(`${expected.canonical}${content.profile.portrait.src}`),
);

let manifest;
try {
  manifest = JSON.parse(manifestSource);
} catch {
  failures.push("manifest is not valid JSON");
}

check("manifest identity", manifest?.name === `${content.profile.name} — Portfolio`);
check("manifest scope", manifest?.start_url === "/" && manifest?.scope === "/");
check("manifest theme", manifest?.theme_color === "#0b0c0c");

console.log("\nSEO release contract\n");
console.table(checks);

if (failures.length > 0) {
  console.error("\nSEO contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("SEO contract passed.");
}
