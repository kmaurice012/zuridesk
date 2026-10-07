import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const thisScript = "scripts/verify-no-secrets.mjs";
const ignoredDirectories = new Set([
  ".expo",
  ".git",
  ".next",
  ".turbo",
  "android",
  "coverage",
  "dist",
  "ios",
  "node_modules"
]);
const sensitiveExtensions = new Set([".jks", ".key", ".p12", ".pfx", ".pem"]);
const maxScannedFileSize = 1024 * 1024;
const violations = [];

const highConfidenceSecretPatterns = [
  ["private key", /-----BEGIN (?:EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/u],
  ["MongoDB Atlas connection string", /mongodb\+srv:\/\//u],
  ["MongoDB URI containing credentials", /mongodb:\/\/[^\s:/@]+:[^\s/@]+@/u],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/u],
  ["GitHub token", /\b(?:gh[opsu]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{70,})\b/u],
  ["live Stripe key", /\b(?:rk|sk)_live_[A-Za-z0-9]{16,}\b/u],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/u]
];

function isAllowedEnvironmentTemplate(path) {
  const name = basename(path);
  return name === ".env.example" || name.endsWith(".example") || name.endsWith(".template");
}

function isEnvironmentFile(path) {
  const name = basename(path);
  return name === ".env" || name.startsWith(".env.");
}

async function* filesOnDisk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) yield* filesOnDisk(path);
      continue;
    }

    if (entry.isFile()) yield relative(repositoryRoot, path);
  }
}

async function candidateFiles() {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
      {
        cwd: repositoryRoot,
        encoding: "buffer"
      }
    );
    return stdout.toString("utf8").split("\0").filter(Boolean);
  } catch {
    const files = [];
    for await (const file of filesOnDisk(repositoryRoot)) files.push(file);
    return files;
  }
}

for (const relativeFile of await candidateFiles()) {
  const normalizedFile = relativeFile.replaceAll("\\", "/");
  if (normalizedFile === thisScript) continue;

  if (isEnvironmentFile(normalizedFile) && !isAllowedEnvironmentTemplate(normalizedFile)) {
    violations.push(`${normalizedFile}: environment files must not be tracked`);
  }

  if (sensitiveExtensions.has(extname(normalizedFile).toLowerCase())) {
    violations.push(`${normalizedFile}: private key or keystore files must not be tracked`);
  }

  const absoluteFile = resolve(repositoryRoot, relativeFile);
  const metadata = await stat(absoluteFile);
  if (metadata.size > maxScannedFileSize) continue;

  const contents = await readFile(absoluteFile);
  if (contents.includes(0)) continue;
  const text = contents.toString("utf8");

  for (const [label, pattern] of highConfidenceSecretPatterns) {
    if (pattern.test(text)) violations.push(`${normalizedFile}: possible ${label}`);
  }
}

if (violations.length > 0) {
  console.error("Potential committed secrets found:\n");
  for (const violation of violations.sort()) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("No secrets or private environment files detected in repository candidates.");
}
