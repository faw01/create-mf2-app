import { rm } from "node:fs/promises";
import { join } from "node:path";
import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import {
  addTsxDevDependency,
  addWorkspacesField,
  convertAllWorkspaceDeps,
  createEnvFiles,
  devOnlyFiles,
  getTemplatePath,
  rewriteAllBunScripts,
  rewriteClaudeSettings,
  rewriteEnvScript,
  rewriteScaffoldDocs,
  run,
  scaffoldTemplate,
  supportedPackageManagers,
  updatePackageJson,
  updatePackageManager,
  writeNpmrc,
  writePnpmWorkspace,
} from "./utils.js";

const getName = async (): Promise<string> => {
  const value = await text({
    defaultValue: "my-app",
    message: "What is your project named?",
    placeholder: "my-app",
  });

  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return value.toString();
};

const getPackageManager = async (): Promise<string> => {
  const value = await select({
    initialValue: "bun",
    message: "Which package manager would you like to use?",
    options: supportedPackageManagers.map((choice) => ({
      label: choice,
      value: choice,
    })),
  });

  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return value.toString();
};

const stripDevOnlyFiles = async (projectDir: string): Promise<void> => {
  await Promise.all(
    devOnlyFiles.map((file) =>
      rm(join(projectDir, file), { force: true, recursive: true })
    )
  );
};

const installDependencies = async (packageManager: string): Promise<void> => {
  const args = packageManager === "npm" ? " install --force" : " install";
  await run(`${packageManager}${args}`, { stdio: "inherit" });
};

const setupConvex = async (packageManager: string): Promise<void> => {
  try {
    const filterCommand = packageManager === "npm" ? "--workspace" : "--filter";
    const command = [
      packageManager,
      "run",
      "build",
      filterCommand,
      "@repo/backend",
    ].join(" ");

    await run(command);
  } catch {
    // noop
  }
};

const initGitRepo = async (): Promise<void> => {
  await run("git init");
};

export const initialize = async (options: {
  name?: string;
  packageManager?: string;
  disableGit?: boolean;
}): Promise<void> => {
  try {
    intro("create-mf2-app init - Let's move fawking fast");

    const cwd = process.cwd();
    const name = options.name ?? (await getName());
    const packageManager =
      options.packageManager ?? (await getPackageManager());

    if (!supportedPackageManagers.includes(packageManager)) {
      throw new Error(
        `Invalid package manager: ${packageManager}. Supported: ${supportedPackageManagers.join(", ")}`
      );
    }

    const projectDir = join(cwd, name);
    const templatePath = getTemplatePath();
    const s = spinner();

    s.start("Copying template...");
    await scaffoldTemplate({
      projectDir,
      templatePath,
      tolerateDotfileRenameErrors: true,
    });

    s.message("Creating env files...");
    await createEnvFiles(projectDir);

    s.message("Configuring project...");
    await updatePackageJson(projectDir, name);

    process.chdir(projectDir);

    if (packageManager !== "bun") {
      s.message("Updating package manager configuration...");
      await updatePackageManager(projectDir, packageManager);
      await rewriteAllBunScripts(projectDir, packageManager);
      await addTsxDevDependency(projectDir);
      await rewriteEnvScript(projectDir, packageManager);
      await rewriteScaffoldDocs(projectDir, packageManager);
      await rewriteClaudeSettings(projectDir, packageManager);

      if (packageManager === "pnpm") {
        await writePnpmWorkspace(projectDir);
      } else {
        await convertAllWorkspaceDeps(projectDir);
        await addWorkspacesField(projectDir);
      }

      if (packageManager === "npm") {
        await writeNpmrc(projectDir);
      }

      await rm(join(projectDir, "bunfig.toml"), { force: true });
    }

    s.message("Removing local-only files...");
    await stripDevOnlyFiles(projectDir);

    s.message("Initializing Git repository...");
    await initGitRepo();

    s.stop("Configuration complete!");
    log.step("Installing dependencies...");
    await installDependencies(packageManager);

    s.start("Setting up Convex...");
    await setupConvex(packageManager);

    if (packageManager === "bun") {
      s.message("Converging lockfile...");
      await run("bun install");
    }

    if (options.disableGit) {
      await rm(join(projectDir, ".git"), { force: true, recursive: true });
    } else {
      s.message("Staging files...");
      await run("git add .");
      s.message("Creating initial commit...");
      await run(
        'git -c user.name="create-mf2-app" -c user.email="noreply@mf2.dev" commit --no-verify -m "feat(create-mf2-app): init"'
      );
    }

    s.stop("Project created successfully!");

    const pm = packageManager === "bun" ? "bun" : packageManager;
    log.info(`Next steps:
  cd ${name}
  ${pm} run dev

Everything boots with zero keys. Your .env.local files are ready to
fill in; a blank value just disables that integration. Run
${pm} run env:check to see what is still blank.

Tell your coding agent to "use the mf2 skill" with your product idea
to turn it into a build plan.

When ready to deploy:
  Fill in .env.production files with production keys
  ${pm} run env:push

Docs: https://mf2.dev/docs`);

    outro("Go forth and conquer");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Failed to create project: ${error}`;

    log.error(message);
    process.exit(1);
  }
};
