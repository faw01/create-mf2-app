import { execSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import {
  devOnlyFiles,
  getTemplatePath,
  scaffoldTemplate,
  updatePackageJson,
} from "./utils";

const projectDir = process.env.E2E_OUTPUT_DIR || "/tmp/e2e-test";
const templatePath = getTemplatePath();

console.log(`Scaffolding project to ${projectDir}...`);

await scaffoldTemplate({ projectDir, templatePath });

await updatePackageJson(projectDir, "e2e-test");

await rm(join(projectDir, "pnpm-lock.yaml"), { force: true });
await rm(join(projectDir, "pnpm-workspace.yaml"), { force: true });

await Promise.all(
  devOnlyFiles.map((file) =>
    rm(join(projectDir, file), { force: true, recursive: true })
  )
);

execSync("git init", { cwd: projectDir, stdio: "ignore" });

console.log("Scaffolded successfully.");
