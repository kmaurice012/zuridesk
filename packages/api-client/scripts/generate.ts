import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(currentDirectory, "../../../apps/api/openapi/openapi.json");
const outputPath = resolve(currentDirectory, "../src/generated/schema.d.ts");
const nodes = await openapiTS(pathToFileURL(inputPath));
const output = `/** Generated from apps/api/openapi/openapi.json. Do not edit manually. */\n${astToString(nodes)}`;

if (process.argv.includes("--check")) {
  const currentOutput = await readFile(outputPath, "utf8").catch(() => "");

  if (currentOutput !== output) {
    console.error("Generated API client types are stale. Run: pnpm generate:api");
    process.exitCode = 1;
  }
} else {
  await writeFile(outputPath, output, "utf8");
}
