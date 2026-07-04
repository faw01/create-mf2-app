#!/usr/bin/env node
// Prepack tripwire. The `files` allowlist in package.json (with its negation
// patterns) is the real exclusion mechanism; this guard makes pack/publish
// fail loudly if that mechanism regresses and dev-tree state (installed
// template node_modules, build caches, env files) is about to ship. Runs
// under plain node because npm lifecycle scripts drive publishing.
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// A clean tree packs ~850 entries / ~3.5 MB unpacked (measured 2026-07).
// A leaked template node_modules jumps to ~246k entries / ~2.9 GB, so this
// headroom tolerates normal template growth while catching real incidents.
export const MAX_ENTRY_COUNT = 5000;
export const MAX_UNPACKED_BYTES = 25 * 1024 * 1024;

// Mirrors the negation patterns in package.json `files`.
const forbiddenSegments = new Set([
  "node_modules",
  ".turbo",
  ".next",
  ".expo",
  ".react-email",
  ".cache",
  ".vercel",
  "dist",
  "out",
  "ios",
  "android",
  "storybook-static",
  ".git",
  ".DS_Store",
  "bun.lock",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "settings.local.json",
]);

// env.example is the tracked source; every other env variant is dev state.
const forbiddenBasenamePatterns = [
  /\.log$/,
  /\.tsbuildinfo$/,
  /^\.env(\..*)?$/,
  /^env\.(local|production)$/,
];

// Sentinels that must exist for the published package to work at all, so an
// under-packed tarball (missing build output or template) also fails.
const requiredPaths = [
  "dist/index.js",
  "template/package.json",
  "template/gitignore",
];

const isForbiddenTemplatePath = (path) => {
  if (!path.startsWith("template/")) {
    return false;
  }

  const segments = path.split("/").slice(1);
  if (segments.some((segment) => forbiddenSegments.has(segment))) {
    return true;
  }

  const basename = segments.at(-1) ?? "";
  return forbiddenBasenamePatterns.some((pattern) => pattern.test(basename));
};

export const assessPackManifest = (manifest) => {
  const problems = [];
  const paths = manifest.files.map((file) => file.path);

  const forbidden = paths.filter(isForbiddenTemplatePath);
  if (forbidden.length > 0) {
    const examples = forbidden.slice(0, 5).join(", ");
    problems.push(
      `${forbidden.length} dev-tree artifact(s) in tarball, e.g. ${examples}`
    );
  }

  if (manifest.entryCount > MAX_ENTRY_COUNT) {
    problems.push(
      `entry count ${manifest.entryCount} exceeds ${MAX_ENTRY_COUNT}`
    );
  }

  if (manifest.unpackedSize > MAX_UNPACKED_BYTES) {
    const actualMb = (manifest.unpackedSize / 1024 / 1024).toFixed(1);
    const limitMb = (MAX_UNPACKED_BYTES / 1024 / 1024).toFixed(0);
    problems.push(`unpacked size ${actualMb} MB exceeds ${limitMb} MB`);
  }

  const packed = new Set(paths);
  for (const required of requiredPaths) {
    if (!packed.has(required)) {
      problems.push(`missing expected file: ${required}`);
    }
  }

  if (!paths.some((path) => path.startsWith("template/.agents/skills/"))) {
    problems.push("missing template/.agents/skills/** entries");
  }

  return problems;
};

const main = () => {
  // --ignore-scripts keeps this dry-run from re-triggering prepack (verified
  // empirically; without it, npm pack inside prepack recurses forever).
  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }
  );

  if (result.error || result.status !== 0) {
    console.error("verify-pack: npm pack --dry-run failed");
    console.error(result.error ?? result.stderr);
    process.exit(1);
  }

  const manifest = JSON.parse(result.stdout)[0];
  const problems = assessPackManifest(manifest);

  if (problems.length > 0) {
    console.error("verify-pack: refusing to pack an anomalous tarball:");
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error(
      "verify-pack: check the `files` patterns in apps/cli/package.json"
    );
    process.exit(1);
  }

  const unpackedMb = (manifest.unpackedSize / 1024 / 1024).toFixed(1);
  console.log(
    `verify-pack: ok (${manifest.entryCount} entries, ${unpackedMb} MB unpacked)`
  );
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
