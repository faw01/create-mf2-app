import { type Command, program } from "commander";
import packageJson from "../package.json";
import { initialize } from "./init.js";

type InitOptions = {
  name?: string;
  packageManager?: string;
  disableGit?: boolean;
};

const nonInteractiveUsage =
  "create-mf2-app <name> --package-manager <bun|npm|yarn|pnpm> [--disable-git]";

program
  .name("create-mf2-app")
  .description(
    "Create a production-ready SaaS app with Next.js, Convex, and AI"
  )
  .version(packageJson.version)
  .addHelpText(
    "after",
    `
Running create-mf2-app with no command runs init.

Examples:
  npx create-mf2-app
  npx create-mf2-app my-app --package-manager bun
  npx create-mf2-app init --name my-app --package-manager bun`
  );

program
  .command("init", { isDefault: true })
  .description("Initialize a new mf² project (default)")
  .argument("[name]", "Name of the project (same as --name)")
  .option("--name <name>", "Name of the project")
  .option(
    "--package-manager <manager>",
    "Package manager to use (bun, npm, yarn, pnpm)"
  )
  .option("--disable-git", "Disable git initialization")
  .action(
    (nameArg: string | undefined, options: InitOptions, command: Command) => {
      const name = options.name ?? nameArg;
      const needsPrompts = !(name && options.packageManager);
      const canPrompt = Boolean(process.stdin.isTTY && process.stdout.isTTY);

      if (needsPrompts && !canPrompt) {
        console.error(
          "create-mf2-app needs an interactive terminal to ask for project details."
        );
        console.error(`Non-interactive usage: ${nonInteractiveUsage}\n`);
        command.outputHelp({ error: true });
        process.exit(1);
      }

      return initialize({ ...options, name });
    }
  );

program.parse(process.argv);
