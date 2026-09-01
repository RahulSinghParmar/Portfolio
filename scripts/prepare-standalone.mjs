import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = resolve(projectRoot, ".next", "standalone");

async function replaceDirectory(source, destination) {
  await rm(destination, { force: true, recursive: true });
  await cp(source, destination, { recursive: true });
}

await mkdir(resolve(standaloneRoot, ".next"), { recursive: true });

await Promise.all([
  replaceDirectory(resolve(projectRoot, "public"), resolve(standaloneRoot, "public")),
  replaceDirectory(
    resolve(projectRoot, ".next", "static"),
    resolve(standaloneRoot, ".next", "static"),
  ),
]);

console.log("Prepared self-contained .next/standalone runtime.");
