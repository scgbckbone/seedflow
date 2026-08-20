import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const output = path.join(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const metadata = {
  commit: process.env.GITHUB_SHA || "local",
  repository: process.env.GITHUB_REPOSITORY || "coinkite/seedflow"
};

await writeFile(
  path.join(output, "build.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
  "utf8"
);

console.log(`Built Seedflow into ${output}`);

