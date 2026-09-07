import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.join(root, "out");
const workerBundle = path.join(root, ".wrangler", "dry-run", "index.js");
const headersFile = path.join(outputDirectory, "_headers");

// Repository release guardrails, deliberately tighter than provider limits.
const limits = {
  assetCount: 500,
  largestAssetBytes: 5 * 1024 * 1024,
  totalAssetBytes: 10 * 1024 * 1024,
  workerBytes: 1024 * 1024,
  headerRules: 20,
  headerLineCharacters: 2_000,
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolutePath)));
    else if (entry.isFile()) files.push(absolutePath);
  }
  return files;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function fail(message) {
  console.error(`Cloudflare package check failed: ${message}`);
  process.exitCode = 1;
}

let assetFiles;
try {
  assetFiles = await listFiles(outputDirectory);
} catch {
  fail("out/ is missing; run npm run build first.");
  process.exit();
}

const assetStats = await Promise.all(
  assetFiles.map(async (file) => ({ file, size: (await stat(file)).size })),
);
const totalAssetBytes = assetStats.reduce((total, entry) => total + entry.size, 0);
const largestAsset = assetStats.reduce(
  (largest, entry) => (entry.size > largest.size ? entry : largest),
  { file: "", size: 0 },
);
const forbiddenOutput = assetFiles.find((file) => {
  const relativePath = path.relative(outputDirectory, file).replaceAll("\\", "/").toLowerCase();
  const basename = path.basename(relativePath);
  return (
    basename === ".dev.vars" ||
    basename.startsWith(".env") ||
    basename.endsWith(".pem") ||
    basename.endsWith(".key")
  );
});

if (forbiddenOutput) {
  fail(`sensitive configuration artifact found at ${path.relative(root, forbiddenOutput)}.`);
}

if (assetFiles.length > limits.assetCount) {
  fail(`asset count ${assetFiles.length} exceeds ${limits.assetCount}.`);
}
if (totalAssetBytes > limits.totalAssetBytes) {
  fail(
    `static output ${formatBytes(totalAssetBytes)} exceeds ${formatBytes(limits.totalAssetBytes)}.`,
  );
}
if (largestAsset.size > limits.largestAssetBytes) {
  fail(
    `${path.relative(root, largestAsset.file)} is ${formatBytes(largestAsset.size)}; limit ${formatBytes(limits.largestAssetBytes)}.`,
  );
}

let workerSize;
try {
  workerSize = (await stat(workerBundle)).size;
} catch {
  fail("Wrangler dry-run bundle is missing; run npm run cloudflare:package first.");
}
if (workerSize !== undefined && workerSize > limits.workerBytes) {
  fail(`Worker bundle ${formatBytes(workerSize)} exceeds ${formatBytes(limits.workerBytes)}.`);
}

let headers;
try {
  headers = await readFile(headersFile, "utf8");
} catch {
  fail("out/_headers is missing.");
}

let headerRuleCount = 0;
if (headers !== undefined) {
  const lines = headers.split(/\r?\n/);
  headerRuleCount = lines.filter(
    (line) => line.length > 0 && !/^\s/.test(line) && !line.startsWith("#"),
  ).length;
  if (headerRuleCount > limits.headerRules) {
    fail(`_headers has ${headerRuleCount} rules; limit ${limits.headerRules}.`);
  }
  if (lines.some((line) => line.length > limits.headerLineCharacters)) {
    fail(`_headers contains a line longer than ${limits.headerLineCharacters} characters.`);
  }
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (packageJson.devDependencies?.wrangler !== "4.129.0") {
  fail("Wrangler must remain pinned exactly to 4.129.0 for this candidate.");
}
if (packageJson.engines?.node !== ">=22.0.0") {
  fail("package.json engines.node must remain >=22.0.0.");
}

console.table([
  { measure: "Static files", actual: assetFiles.length, limit: limits.assetCount },
  {
    measure: "Static output",
    actual: formatBytes(totalAssetBytes),
    limit: formatBytes(limits.totalAssetBytes),
  },
  {
    measure: "Largest asset",
    actual: formatBytes(largestAsset.size),
    limit: formatBytes(limits.largestAssetBytes),
  },
  {
    measure: "Worker bundle",
    actual: workerSize === undefined ? "missing" : formatBytes(workerSize),
    limit: formatBytes(limits.workerBytes),
  },
  { measure: "Header rules", actual: headerRuleCount, limit: limits.headerRules },
]);

if (process.exitCode) process.exit();
console.log("Cloudflare package limits passed.");
