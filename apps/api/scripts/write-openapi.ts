import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildApp } from "../src/app";

const app = await buildApp({
  allowedOrigins: ["http://localhost:3000"],
  checkDatabase: () => Promise.resolve("down"),
  environment: "test",
  logger: false
});

await app.ready();

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDirectory, "../openapi/openapi.json");
const output = `${JSON.stringify(app.swagger(), null, 2)}\n`;

if (process.argv.includes("--check")) {
  const currentOutput = await readFile(outputPath, "utf8").catch(() => "");

  if (currentOutput !== output) {
    console.error("OpenAPI artifact is stale. Run: pnpm generate:api");
    process.exitCode = 1;
  }
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, "utf8");
}

await app.close();
