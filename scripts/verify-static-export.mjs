import { access, readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const projectRoot = process.cwd();
const outputRoot = resolve(projectRoot, "out");
const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "icon.png",
  "apple-icon.png",
  "opengraph-image.png",
  "twitter-image.png",
  "_headers",
];

const failures = [];

for (const file of requiredFiles) {
  try {
    await access(join(outputRoot, file));
  } catch {
    failures.push(`missing ${file}`);
  }
}

try {
  const home = await readFile(join(outputRoot, "index.html"), "utf8");
  if (!home.includes("/_next/static/")) failures.push("home does not reference exported assets");
  if (!home.includes("Rahul Singh Parmar"))
    failures.push("home does not contain portfolio identity");
  for (const image of ["icon.png", "apple-icon.png", "opengraph-image.png", "twitter-image.png"]) {
    if (!home.includes(`/${image}`)) failures.push(`home does not reference ${image}`);
  }
} catch {
  // The missing index is already reported above.
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );
  return files.flat();
}

if (failures.length === 0) {
  const files = await collectFiles(outputRoot);
  const exportedApi = files.find((file) => {
    const path = relative(outputRoot, file).replaceAll("\\", "/");
    return path === "api" || path.startsWith("api/");
  });
  if (exportedApi) failures.push(`unexpected API artifact ${relative(outputRoot, exportedApi)}`);
}

if (failures.length > 0) {
  console.error("Static export verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Verified static portfolio export in out/ (API routes remain outside the asset artifact).",
);
