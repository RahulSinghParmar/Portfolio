import { brotliCompressSync, gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const buildRoot = join(projectRoot, "out");
const homeDocument = join(buildRoot, "index.html");
const publicImages = join(buildRoot, "images");

const kibibytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
const unique = (values) => [...new Set(values)];

function compressedSize(buffer) {
  return {
    raw: buffer.length,
    gzip: gzipSync(buffer, { level: 9 }).length,
    brotli: brotliCompressSync(buffer).length,
  };
}

function extractAssets(html, expression) {
  return unique([...html.matchAll(expression)].map((match) => match[1].split("?")[0]));
}

function resolveBuildAsset(assetUrl) {
  if (!assetUrl.startsWith("/_next/")) {
    throw new Error(`Unsupported build asset URL: ${assetUrl}`);
  }

  return join(buildRoot, assetUrl.slice(1));
}

function collectFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  });
}

if (!existsSync(homeDocument)) {
  console.error("Performance budget requires a static export. Run `npm run build` first.");
  process.exit(1);
}

const htmlBuffer = readFileSync(homeDocument);
const html = htmlBuffer.toString("utf8");
const scriptUrls = extractAssets(html, /<script[^>]+src="([^"]+)"/g);
const styleUrls = extractAssets(html, /<link[^>]+href="([^"]+\.css[^\"]*)"/g);

const scripts = scriptUrls.map((url) => {
  const path = resolveBuildAsset(url);
  return { url, ...compressedSize(readFileSync(path)) };
});
const styles = styleUrls.map((url) => {
  const path = resolveBuildAsset(url);
  return { url, ...compressedSize(readFileSync(path)) };
});

const sum = (assets, format) => assets.reduce((total, asset) => total + asset[format], 0);
const htmlSizes = compressedSize(htmlBuffer);
const imageFiles = collectFiles(publicImages).filter((file) =>
  [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(extname(file).toLowerCase()),
);
const imageSizes = imageFiles.map((file) => ({
  file: relative(projectRoot, file).replaceAll("\\", "/"),
  raw: statSync(file).size,
}));

const measurements = {
  "home HTML / raw": htmlSizes.raw,
  "initial JavaScript / raw": sum(scripts, "raw"),
  "initial JavaScript / Brotli": sum(scripts, "brotli"),
  "initial CSS / raw": sum(styles, "raw"),
  "critical route / Brotli": htmlSizes.brotli + sum(scripts, "brotli") + sum(styles, "brotli"),
  "public images / total": imageSizes.reduce((total, image) => total + image.raw, 0),
  "public images / largest": Math.max(0, ...imageSizes.map((image) => image.raw)),
};

const budgets = {
  "home HTML / raw": 160 * 1024,
  "initial JavaScript / raw": 620 * 1024,
  "initial JavaScript / Brotli": 190 * 1024,
  "initial CSS / raw": 64 * 1024,
  "critical route / Brotli": 225 * 1024,
  "public images / total": 350 * 1024,
  "public images / largest": 200 * 1024,
};

console.log("\nHome route performance profile\n");
console.table(
  Object.entries(measurements).map(([metric, value]) => ({
    metric,
    measured: kibibytes(value),
    budget: kibibytes(budgets[metric]),
    status: value <= budgets[metric] ? "PASS" : "FAIL",
  })),
);

console.log("Initial JavaScript assets");
console.table(
  scripts.map((asset) => ({
    asset: asset.url.replace("/_next/static/chunks/", ""),
    raw: kibibytes(asset.raw),
    brotli: kibibytes(asset.brotli),
  })),
);

console.log("Public raster assets");
console.table(imageSizes.map((image) => ({ asset: image.file, raw: kibibytes(image.raw) })));

const failures = Object.entries(measurements).filter(([metric, value]) => value > budgets[metric]);

if (failures.length > 0) {
  console.error(`Performance budget failed: ${failures.map(([metric]) => metric).join(", ")}.`);
  process.exit(1);
}

console.log("Performance budget passed.\n");
