import { execSync } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  copyDirectory,
  devOnlyFiles,
  dotfileRenames,
  getTemplatePath,
  materializeSkills,
  updatePackageJson,
} from "./utils";

const projectDir = process.env.E2E_OUTPUT_DIR || "/tmp/e2e-test";
const templatePath = getTemplatePath();

console.log(`Scaffolding project to ${projectDir}...`);

await mkdir(projectDir, { recursive: true });
await copyDirectory(templatePath, projectDir);
await materializeSkills(projectDir);

await rename(join(projectDir, "gitignore"), join(projectDir, ".gitignore"));

for (const { dir, from, to } of dotfileRenames) {
  await rename(join(projectDir, dir, from), join(projectDir, dir, to));
}

await updatePackageJson(projectDir, "e2e-test");

await rm(join(projectDir, "pnpm-lock.yaml"), { force: true });
await rm(join(projectDir, "pnpm-workspace.yaml"), { force: true });

for (const file of devOnlyFiles) {
  await rm(join(projectDir, file), { recursive: true, force: true });
}

execSync("git init", { cwd: projectDir, stdio: "ignore" });

console.log("Scaffolded successfully.");
