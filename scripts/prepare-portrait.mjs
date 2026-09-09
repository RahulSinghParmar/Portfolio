import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "..");
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const outputPath = path.resolve(
  process.argv[3] ?? path.join(projectRoot, "public", "images", "rahul-portrait.webp"),
);

if (!inputPath) {
  console.error(
    "Usage: npm run asset:portrait -- <solid-green-source.png> [public/images/output.webp]",
  );
  process.exit(1);
}

const source = sharp(inputPath).rotate().removeAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);

for (let sourceOffset = 0, targetOffset = 0; sourceOffset < data.length; sourceOffset += 3) {
  const red = data[sourceOffset];
  const green = data[sourceOffset + 1];
  const blue = data[sourceOffset + 2];
  const greenSeparation = green - Math.max(red, blue);

  // The prepared source uses a solid green plate. This soft threshold retains
  // hair and fabric edges while removing the plate and its antialiased spill.
  const alpha = Math.max(0, Math.min(255, Math.round(((100 - greenSeparation) / 80) * 255)));
  const desaturatedGreen = alpha < 250 ? Math.min(green, Math.max(red, blue) + 8) : green;

  rgba[targetOffset] = red;
  rgba[targetOffset + 1] = desaturatedGreen;
  rgba[targetOffset + 2] = blue;
  rgba[targetOffset + 3] = alpha;
  targetOffset += 4;
}

await mkdir(path.dirname(outputPath), { recursive: true });

const result = await sharp(rgba, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 840, withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true })
  .toFile(outputPath);

const outputMetadata = await sharp(outputPath).metadata();
const outputSize = (await stat(outputPath)).size;

if (!outputMetadata.hasAlpha) {
  throw new Error("Portrait output does not contain an alpha channel.");
}

console.log(
  JSON.stringify(
    {
      output: path.relative(projectRoot, outputPath).replaceAll("\\", "/"),
      width: result.width,
      height: result.height,
      alpha: outputMetadata.hasAlpha,
      kibibytes: Number((outputSize / 1024).toFixed(1)),
    },
    null,
    2,
  ),
);
