import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const NEXT_PUBLIC_RE = /^NEXT_PUBLIC_/;
const CONVEX_MANAGED_RE = /^(CONVEX_DEPLOYMENT|CONVEX_DEPLOY_KEY)$/;
const VERCEL_MANAGED_RE = /^VERCEL_/;

const discoverApps = (): string[] => {
  const dirs = ["apps", "packages"];
  const results: string[] = [];

  for (const dir of dirs) {
    const base = join(ROOT, dir);
    if (!existsSync(base)) {
      continue;
    }

    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const envExample = join(base, entry.name, ".env.example");
      if (existsSync(envExample)) {
        results.push(join(dir, entry.name));
      }
    }
  }

  return results.sort();
};

const parseEnvFile = (path: string): Map<string, string> => {
  const entries = new Map<string, string>();

  if (!existsSync(path)) {
    return entries;
  }

  const content = readFileSync(path, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.set(key, value);
  }

  return entries;
};

const shouldSkipForVercel = (key: string, value: string): boolean => {
  if (CONVEX_MANAGED_RE.test(key)) {
    return true;
  }
  if (VERCEL_MANAGED_RE.test(key)) {
    return true;
  }
  if (value.includes("localhost")) {
    return true;
  }
  if (value === "") {
    return true;
  }
  return false;
};

const shouldSkipForConvex = (key: string, value: string): boolean => {
  if (NEXT_PUBLIC_RE.test(key)) {
    return true;
  }
  if (CONVEX_MANAGED_RE.test(key)) {
    return true;
  }
  if (VERCEL_MANAGED_RE.test(key)) {
    return true;
  }
  if (value.includes("localhost")) {
    return true;
  }
  if (value === "") {
    return true;
  }
  return false;
};

const checkEnvTarget = (
  app: string,
  appDir: string,
  target: string,
  requiredKeys: string[]
): boolean => {
  const targetPath = join(appDir, target);

  if (!existsSync(targetPath)) {
    console.log(
      `\n${app}/${target}: file missing (copy ${app}/.env.example to ${app}/${target})`
    );
    return true;
  }

  const values = parseEnvFile(targetPath);
  const missing: string[] = [];

  for (const key of requiredKeys) {
    const value = values.get(key);
    if (value === undefined || value === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.log(`\n${app}/${target}: ${missing.length} missing key(s)`);
    for (const key of missing) {
      console.log(`  - ${key}`);
    }
    return true;
  }

  return false;
};

const check = (): void => {
  const apps = discoverApps();
  let hasErrors = false;

  for (const app of apps) {
    const appDir = join(ROOT, app);
    const requiredKeys = [...parseEnvFile(join(appDir, ".env.example")).keys()];

    for (const target of [".env.local", ".env.production"]) {
      if (checkEnvTarget(app, appDir, target, requiredKeys)) {
        hasErrors = true;
      }
    }
  }

  if (!hasErrors) {
    console.log("All env files have required keys filled in.");
  }
};

const pushVercelEnv = (
  appDir: string,
  envFile: string,
  environments: string[]
): void => {
  const envPath = join(appDir, envFile);
  const entries = parseEnvFile(envPath);
  const envTarget = environments.join(" ");
  const label = relative(ROOT, appDir);

  for (const [key, value] of entries) {
    if (shouldSkipForVercel(key, value)) {
      continue;
    }

    try {
      execSync(
        `printf "%s" "${value}" | vercel env add ${key} ${envTarget} --force`,
        { cwd: appDir, stdio: "pipe" }
      );
      console.log(`  vercel  ${label}  ${key} → ${envTarget}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  vercel  ${label}  ${key} FAILED: ${message}`);
    }
  }
};

const pushConvexEnv = (
  appDir: string,
  envFile: string,
  prod: boolean
): void => {
  const envPath = join(appDir, envFile);
  const entries = parseEnvFile(envPath);
  const label = prod ? "prod" : "dev";
  const flag = prod ? " --prod" : "";

  for (const [key, value] of entries) {
    if (shouldSkipForConvex(key, value)) {
      continue;
    }

    try {
      execSync(`bunx convex env set ${key}="${value}"${flag}`, {
        cwd: appDir,
        stdio: "pipe",
      });
      console.log(`  convex (${label})  ${key}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  convex (${label})  ${key} FAILED: ${message}`);
    }
  }
};

const push = (): void => {
  const apps = discoverApps();

  for (const app of apps) {
    const appDir = join(ROOT, app);
    const hasVercel = existsSync(join(appDir, ".vercel"));

    if (!hasVercel) {
      console.log(
        `\n${app}: no .vercel/ link found, skipping Vercel push (run \`vercel link\` in ${app})`
      );
      continue;
    }

    console.log(`\n${app}: pushing to Vercel...`);

    if (existsSync(join(appDir, ".env.local"))) {
      pushVercelEnv(appDir, ".env.local", ["development", "preview"]);
    }

    if (existsSync(join(appDir, ".env.production"))) {
      pushVercelEnv(appDir, ".env.production", ["production"]);
    }
  }

  const mainAppDir = join(ROOT, "apps", "app");
  const hasConvexConfig =
    existsSync(join(ROOT, "packages", "backend")) ||
    existsSync(join(mainAppDir, ".env.local"));

  if (hasConvexConfig) {
    console.log("\napps/app: pushing to Convex...");

    if (existsSync(join(mainAppDir, ".env.local"))) {
      pushConvexEnv(mainAppDir, ".env.local", false);
    }

    if (existsSync(join(mainAppDir, ".env.production"))) {
      pushConvexEnv(mainAppDir, ".env.production", true);
    }
  }

  console.log("\nDone.");
};

const command = process.argv[2];

switch (command) {
  case "check":
    check();
    break;
  case "push":
    push();
    break;
  default:
    console.log("Usage: bun scripts/env.ts <check|push>");
    console.log("");
    console.log("Commands:");
    console.log("  check  Validate all env files have required keys filled in");
    console.log("  push   Sync env vars to Vercel and Convex");
    process.exit(1);
}
