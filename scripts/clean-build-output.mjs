import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const generatedDirectories = [".next", "out"];

await Promise.all(
  generatedDirectories.map((directory) =>
    rm(resolve(projectRoot, directory), {
      force: true,
      recursive: true,
    }),
  ),
);

console.log("Removed generated Next.js and static-export output.");
