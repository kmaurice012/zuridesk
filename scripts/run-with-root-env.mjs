import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const environmentPath = resolve(repositoryRoot, ".env.local");
const [command, ...args] = process.argv.slice(2);

if (command === undefined) {
  console.error("Usage: node scripts/run-with-root-env.mjs <command> [...args]");
  process.exit(1);
}

if (existsSync(environmentPath)) {
  process.loadEnvFile(environmentPath);
}

const child = spawn(command, args, {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}

child.once("error", (error) => {
  console.error(`Unable to start ${command}:`, error);
  process.exitCode = 1;
});

child.once("close", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
