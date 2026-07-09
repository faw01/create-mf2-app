import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = dirname(dirname(fileURLToPath(import.meta.url)));
const rootDir = join(backendDir, "..", "..");

const stripQuotes = (value) => {
  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  return isQuoted ? value.slice(1, -1) : value;
};

const readEnvValue = (path, key) => {
  if (!existsSync(path)) {
    return;
  }

  const line = readFileSync(path, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) {
    return;
  }

  return stripQuotes(line.slice(key.length + 1).trim());
};

const writeEnvValue = (path, key, value) => {
  const content = readFileSync(path, "utf8");
  const lines = content.split("\n");
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  const entry = `${key}=${value}`;

  if (index === -1) {
    const separator = content === "" || content.endsWith("\n") ? "" : "\n";
    writeFileSync(path, `${content}${separator}${entry}\n`);
    return;
  }

  lines[index] = entry;
  writeFileSync(path, lines.join("\n"));
};

const convexUrl = readEnvValue(join(backendDir, ".env.local"), "CONVEX_URL");

const targets = [
  {
    key: "NEXT_PUBLIC_CONVEX_URL",
    path: join(rootDir, "apps", "app", ".env.local"),
  },
  {
    key: "EXPO_PUBLIC_CONVEX_URL",
    path: join(rootDir, "apps", "mobile", ".env.local"),
  },
];

if (convexUrl) {
  for (const { path, key } of targets) {
    if (!existsSync(path) || readEnvValue(path, key) === convexUrl) {
      continue;
    }

    writeEnvValue(path, key, convexUrl);
    console.log(`Synced ${key}=${convexUrl} to ${relative(rootDir, path)}`);
  }
}
