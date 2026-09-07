import { copyFile, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const outputRoot = resolve(process.cwd(), "out");
const generatedImages = ["apple-icon", "icon", "opengraph-image", "twitter-image"];
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

for (const name of generatedImages) {
  const source = join(outputRoot, name);
  const target = join(outputRoot, `${name}.png`);
  const bytes = await readFile(source);

  if (!bytes.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`Expected ${name} to contain a PNG image.`);
  }

  await copyFile(source, target);
}

async function collectTextArtifacts(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectTextArtifacts(path);
      return [".html", ".txt", ".webmanifest"].includes(extname(entry.name)) ? [path] : [];
    }),
  );
  return files.flat();
}

for (const file of await collectTextArtifacts(outputRoot)) {
  const source = await readFile(file, "utf8");
  const updated = source
    .replace(/\/opengraph-image\?[A-Za-z0-9_-]+/g, "/opengraph-image.png")
    .replace(/\/twitter-image\?[A-Za-z0-9_-]+/g, "/twitter-image.png");

  if (updated !== source) await writeFile(file, updated, "utf8");
}

console.log("Prepared named PNG metadata assets and references for Cloudflare MIME detection.");
