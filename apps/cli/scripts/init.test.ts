import {
  afterAll,
  beforeEach,
  describe,
  expect,
  setDefaultTimeout,
  test,
} from "bun:test";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  addTsxDevDependency,
  addWorkspacesField,
  convertWorkspaceDeps,
  copyDirectory,
  copyExclusions,
  createEnvFiles,
  devOnlyFiles,
  dotfileRenames,
  getTemplatePath,
  materializeSkills,
  rewriteAllBunScripts,
  rewriteBunHooks,
  rewriteBunProse,
  rewriteBunScripts,
  rewriteClaudeSettings,
  rewriteEnvScript,
  rewriteScaffoldDocs,
  supportedPackageManagers,
  tsxVersion,
  updatePackageJson,
  updatePackageManager,
  writePnpmWorkspace,
} from "./utils.js";

const templatePath = getTemplatePath();
const tmpDir = join(import.meta.dirname, "..", ".tmp-test");
const exactVersionRe = /^\d+\.\d+\.\d+$/;
const expoEnvIgnoreLineRe = /^expo-env\.d\.ts$/m;

const findTemplateFiles = (fileName: string): string[] => {
  const matches: string[] = [];

  const walk = (dir: string, rel: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (copyExclusions.has(entry.name)) {
        continue;
      }
      const entryRel = rel ? join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), entryRel);
      } else if (entry.name === fileName) {
        matches.push(entryRel);
      }
    }
  };

  walk(templatePath, "");
  return matches;
};

setDefaultTimeout(60_000);

beforeEach(async () => {
  await mkdir(tmpDir, { recursive: true });
});

afterAll(async () => {
  await rm(tmpDir, { force: true, recursive: true });
});

describe("template integrity", () => {
  test("template directory exists", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("gitignore file exists (without dot)", () => {
    expect(existsSync(join(templatePath, "gitignore"))).toBe(true);
    expect(existsSync(join(templatePath, ".gitignore"))).toBe(false);
  });

  test("no .gitignore anywhere in the template (npm pack drops them)", () => {
    expect(findTemplateFiles(".gitignore")).toEqual([]);
  });

  test("env files exist without leading dot", () => {
    for (const { dir, from } of dotfileRenames) {
      const filePath = join(templatePath, dir, from);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  test("env files do NOT exist with leading dot in template", () => {
    for (const { dir, to } of dotfileRenames) {
      const filePath = join(templatePath, dir, to);
      expect(existsSync(filePath)).toBe(false);
    }
  });

  test("root package.json exists", () => {
    expect(existsSync(join(templatePath, "package.json"))).toBe(true);
  });

  test("turbo.json exists", () => {
    expect(existsSync(join(templatePath, "turbo.json"))).toBe(true);
  });

  test("all expected apps exist", () => {
    const expected = ["api", "app", "docs", "email", "storybook", "web"];
    for (const app of expected) {
      expect(existsSync(join(templatePath, "apps", app))).toBe(true);
    }
  });

  test("all expected packages exist", () => {
    const expected = [
      "ai",
      "analytics",
      "auth",
      "backend",
      "cms",
      "collaboration",
      "convex",
      "design-system",
      "email",
      "feature-flags",
      "internationalization",
      "next-config",
      "notifications",
      "observability",
      "payments",
      "rate-limit",
      "security",
      "seo",
      "storage",
      "typescript-config",
      "webhooks",
    ];
    for (const pkg of expected) {
      expect(existsSync(join(templatePath, "packages", pkg))).toBe(true);
    }
  });

  test("template ships the agent files", () => {
    expect(existsSync(join(templatePath, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(templatePath, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(templatePath, ".mcp.json"))).toBe(true);
    expect(existsSync(join(templatePath, ".claude", "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(templatePath, ".agents", "AGENTS.md"))).toBe(true);
    expect(existsSync(join(templatePath, ".claude", "settings.json"))).toBe(
      true
    );
    expect(existsSync(join(templatePath, ".claude", "skills"))).toBe(true);
    expect(existsSync(join(templatePath, ".agents", "skills"))).toBe(true);
  });

  test("agent anchor files resolve to the canonical .agents/AGENTS.md", () => {
    const rootClaude = readFileSync(join(templatePath, "CLAUDE.md"), "utf8");
    const rootAgents = readFileSync(join(templatePath, "AGENTS.md"), "utf8");
    const claudeDir = readFileSync(
      join(templatePath, ".claude", "CLAUDE.md"),
      "utf8"
    );

    expect(rootClaude.trim()).toBe("@.claude/CLAUDE.md");
    expect(rootAgents.trim()).toBe("@.agents/AGENTS.md");
    expect(claudeDir.trim()).toBe("@../.agents/AGENTS.md");
  });
});

describe("copyDirectory", () => {
  test("copies template to destination", async () => {
    const dest = join(tmpDir, "copy-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    expect(existsSync(join(dest, "package.json"))).toBe(true);
    expect(existsSync(join(dest, "turbo.json"))).toBe(true);
    expect(existsSync(join(dest, "gitignore"))).toBe(true);
    expect(existsSync(join(dest, "apps"))).toBe(true);
    expect(existsSync(join(dest, "packages"))).toBe(true);
  });

  test("excludes node_modules, lockfiles, .git, .turbo, .DS_Store", async () => {
    const dest = join(tmpDir, "exclusion-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    for (const exclusion of copyExclusions) {
      expect(existsSync(join(dest, exclusion))).toBe(false);
    }
  });

  test("copies dotfiles that are not excluded", async () => {
    const dest = join(tmpDir, "dotfile-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    expect(existsSync(join(dest, ".github"))).toBe(true);
    expect(existsSync(join(dest, ".vscode"))).toBe(true);
  });

  test("copies env files stored without leading dot", async () => {
    const dest = join(tmpDir, "env-copy-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    for (const { dir, from } of dotfileRenames) {
      expect(existsSync(join(dest, dir, from))).toBe(true);
    }
  });
});

describe("dotfileRenames", () => {
  test("only env.example entries exist (no env.local)", () => {
    const examples = dotfileRenames.filter((r) => r.from === "env.example");
    const locals = dotfileRenames.filter((r) => r.from === "env.local");

    expect(examples.length).toBeGreaterThan(0);
    expect(locals.length).toBe(0);
  });

  test("all directories in dotfileRenames exist in the template", () => {
    for (const { dir } of dotfileRenames) {
      expect(existsSync(join(templatePath, dir))).toBe(true);
    }
  });

  test("covers all apps/packages that have env.example", () => {
    const dirsWithEnvExample = new Set<string>();

    const scan = (base: string) => {
      if (!existsSync(base)) {
        return;
      }
      for (const entry of readdirSync(base, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }
        if (existsSync(join(base, entry.name, "env.example"))) {
          const rel = join(base.split("/").pop() ?? "", entry.name);
          dirsWithEnvExample.add(rel);
        }
      }
    };

    scan(join(templatePath, "apps"));
    scan(join(templatePath, "packages"));

    const renameDirs = new Set(
      dotfileRenames.filter((r) => r.from === "env.example").map((r) => r.dir)
    );

    for (const dir of dirsWithEnvExample) {
      expect(renameDirs.has(dir)).toBe(true);
    }
  });

  test("covers every un-dotted gitignore in the template", () => {
    const nestedGitignores = findTemplateFiles("gitignore")
      .filter((rel) => rel !== "gitignore")
      .map((rel) => dirname(rel))
      .sort((a, b) => a.localeCompare(b));

    const renameDirs = dotfileRenames
      .filter((r) => r.from === "gitignore")
      .map((r) => r.dir)
      .sort((a, b) => a.localeCompare(b));

    expect(nestedGitignores.length).toBeGreaterThan(0);
    expect(renameDirs).toEqual(nestedGitignores);
  });

  test("every gitignore rename source exists and has content", () => {
    for (const { dir, from, to } of dotfileRenames.filter(
      (r) => r.from === "gitignore"
    )) {
      expect(to).toBe(".gitignore");
      const content = readFileSync(join(templatePath, dir, from), "utf8");
      expect(content.trim().length).toBeGreaterThan(0);
    }
  });

  test("mobile gitignore covers expo generated files", () => {
    const content = readFileSync(
      join(templatePath, "apps", "mobile", "gitignore"),
      "utf8"
    );
    expect(content).toContain("expo-env.d.ts");
    expect(content).toContain(".expo/");
  });
});

describe("updatePackageJson", () => {
  test("sets project name in package.json", async () => {
    const dest = join(tmpDir, "pkg-name-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await updatePackageJson(dest, "my-cool-app");

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.name).toBe("my-cool-app");
  });

  test("preserves other fields", async () => {
    const dest = join(tmpDir, "pkg-preserve-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await updatePackageJson(dest, "test-app");

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.private).toBe(true);
    expect(content.scripts).toBeDefined();
    expect(content.devDependencies).toBeDefined();
  });
});

describe("updatePackageManager", () => {
  test("sets correct packageManager for npm", async () => {
    const dest = join(tmpDir, "pm-npm-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await updatePackageManager(dest, "npm");

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.packageManager).toStartWith("npm@");
  });

  test("sets correct packageManager for yarn", async () => {
    const dest = join(tmpDir, "pm-yarn-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await updatePackageManager(dest, "yarn");

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.packageManager).toStartWith("yarn@");
  });

  test("sets correct packageManager for pnpm", async () => {
    const dest = join(tmpDir, "pm-pnpm-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await updatePackageManager(dest, "pnpm");

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.packageManager).toStartWith("pnpm@");
  });
});

describe("convertWorkspaceDeps", () => {
  test("converts workspace:* to *", async () => {
    const dest = join(tmpDir, "ws-deps-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    const pkgPath = join(dest, "package.json");
    await convertWorkspaceDeps(pkgPath);

    const content = JSON.parse(await readFile(pkgPath, "utf8"));

    for (const depType of ["dependencies", "devDependencies"]) {
      const deps = content[depType];
      if (!deps) {
        continue;
      }
      for (const [, version] of Object.entries(deps)) {
        expect(version).not.toBe("workspace:*");
      }
    }
  });
});

describe("addWorkspacesField", () => {
  test("adds workspaces array to package.json", async () => {
    const dest = join(tmpDir, "ws-field-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await addWorkspacesField(dest);

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.workspaces).toEqual(["apps/*", "packages/*"]);
  });
});

describe("rewriteBunScripts", () => {
  const templateRootScripts = {
    "bump-deps": "bunx npm-check-updates --deep -u -p bun && bun install",
    "bump-ui":
      "bunx shadcn@latest add --all --overwrite -c packages/design-system",
    "bump-ui-native":
      "bunx --bun @react-native-reusables/cli@latest add --all --overwrite -c apps/mobile",
    dev: "turbo dev",
    "env:check": "bun scripts/env.ts check",
  };

  test("strips the bun runtime prefix from next scripts", () => {
    const scripts = { dev: "bun --bun next dev -p 3000" };

    for (const pm of ["npm", "yarn", "pnpm"]) {
      expect(rewriteBunScripts(scripts, pm).dev).toBe("next dev -p 3000");
    }
  });

  test("rewrites bunx and bun install for npm", () => {
    const result = rewriteBunScripts(templateRootScripts, "npm");

    expect(result["bump-deps"]).toBe(
      "npx npm-check-updates --deep -u -p npm && npm install"
    );
    expect(result["bump-ui"]).toBe(
      "npx shadcn@latest add --all --overwrite -c packages/design-system"
    );
    expect(result["bump-ui-native"]).toBe(
      "npx @react-native-reusables/cli@latest add --all --overwrite -c apps/mobile"
    );
  });

  test("rewrites bunx and bun install for pnpm", () => {
    const result = rewriteBunScripts(templateRootScripts, "pnpm");

    expect(result["bump-deps"]).toBe(
      "pnpm dlx npm-check-updates --deep -u -p pnpm && pnpm install"
    );
    expect(result["bump-ui"]).toBe(
      "pnpm dlx shadcn@latest add --all --overwrite -c packages/design-system"
    );
    expect(result["bump-ui-native"]).toBe(
      "pnpm dlx @react-native-reusables/cli@latest add --all --overwrite -c apps/mobile"
    );
  });

  test("rewrites bunx to npx for yarn classic (no dlx)", () => {
    const result = rewriteBunScripts(templateRootScripts, "yarn");

    expect(result["bump-deps"]).toBe(
      "npx npm-check-updates --deep -u -p yarn && yarn install"
    );
    expect(result["bump-ui"]).toStartWith("npx shadcn@latest");
    expect(result["bump-ui-native"]).toStartWith(
      "npx @react-native-reusables/cli@latest"
    );
  });

  test("rewrites bun script-file invocations to a local tsx runner", () => {
    expect(rewriteBunScripts(templateRootScripts, "npm")["env:check"]).toBe(
      "npx tsx scripts/env.ts check"
    );
    expect(rewriteBunScripts(templateRootScripts, "yarn")["env:check"]).toBe(
      "npx tsx scripts/env.ts check"
    );
    expect(rewriteBunScripts(templateRootScripts, "pnpm")["env:check"]).toBe(
      "pnpm exec tsx scripts/env.ts check"
    );
  });

  test("leaves non-bun scripts untouched", () => {
    for (const pm of ["npm", "yarn", "pnpm"]) {
      expect(rewriteBunScripts(templateRootScripts, pm).dev).toBe("turbo dev");
    }
  });

  test("is a no-op for bun", () => {
    expect(rewriteBunScripts(templateRootScripts, "bun")).toEqual(
      templateRootScripts
    );
  });
});

describe("rewriteAllBunScripts", () => {
  const collectScripts = (projectDir: string): Map<string, string> => {
    const scripts = new Map<string, string>();
    const paths = [join(projectDir, "package.json")];

    for (const dir of ["apps", "packages"]) {
      const base = join(projectDir, dir);
      if (!existsSync(base)) {
        continue;
      }
      for (const entry of readdirSync(base)) {
        const pkgJson = join(base, entry, "package.json");
        if (existsSync(pkgJson)) {
          paths.push(pkgJson);
        }
      }
    }

    for (const path of paths) {
      const pkg = JSON.parse(readFileSync(path, "utf8"));
      for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
        scripts.set(`${path}#${name}`, command as string);
      }
    }

    return scripts;
  };

  test("no rewritten token remains in any workspace package.json", async () => {
    const dest = join(tmpDir, "rewrite-all-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteAllBunScripts(dest, "npm");

    const ownedTokens = [
      "bun --bun ",
      "bunx ",
      "bun install",
      "bun scripts/",
      "-p bun",
    ];

    for (const [key, command] of collectScripts(dest)) {
      for (const token of ownedTokens) {
        expect(`${key} => ${command}`).not.toContain(token);
      }
    }
  });

  test("rewrites app dev scripts so they run without bun", async () => {
    const dest = join(tmpDir, "rewrite-apps-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteAllBunScripts(dest, "pnpm");

    const app = JSON.parse(
      readFileSync(join(dest, "apps", "app", "package.json"), "utf8")
    );
    expect(app.scripts.dev).toBe("next dev -p 3000");
    expect(app.scripts.build).toBe("next build");

    const web = JSON.parse(
      readFileSync(join(dest, "apps", "web", "package.json"), "utf8")
    );
    expect(web.scripts.dev).toBe("next dev -p 3001");

    const api = JSON.parse(
      readFileSync(join(dest, "apps", "api", "package.json"), "utf8")
    );
    expect(api.scripts["next-dev"]).toBe("next dev -p 3002");
  });

  test("leaves the template untouched for bun", async () => {
    const dest = join(tmpDir, "rewrite-bun-noop-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    const before = collectScripts(dest);
    await rewriteAllBunScripts(dest, "bun");
    const after = collectScripts(dest);

    expect(after).toEqual(before);
  });
});

describe("addTsxDevDependency", () => {
  test("template does not declare tsx (bun runs scripts natively)", () => {
    const template = JSON.parse(
      readFileSync(join(templatePath, "package.json"), "utf8")
    );
    expect(template.devDependencies.tsx).toBeUndefined();
    expect(template.dependencies?.tsx).toBeUndefined();
  });

  test("adds a pinned tsx devDependency for non-bun scaffolds", async () => {
    const dest = join(tmpDir, "tsx-dep-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await addTsxDevDependency(dest);

    const content = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    expect(content.devDependencies.tsx).toBe(tsxVersion);
  });

  test("preserves the existing devDependencies", async () => {
    const dest = join(tmpDir, "tsx-preserve-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    const before = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );
    await addTsxDevDependency(dest);
    const after = JSON.parse(
      await readFile(join(dest, "package.json"), "utf8")
    );

    for (const [dep, version] of Object.entries(before.devDependencies)) {
      expect(after.devDependencies[dep]).toBe(version as string);
    }
  });
});

describe("rewriteEnvScript", () => {
  test("template env.ts invokes convex through bunx", () => {
    const content = readFileSync(
      join(templatePath, "scripts", "env.ts"),
      "utf8"
    );
    expect(content).toContain("bunx convex ");
  });

  test("rewrites bunx to npx for npm and yarn", async () => {
    await Promise.all(
      ["npm", "yarn"].map(async (pm) => {
        const dest = join(tmpDir, `env-script-${pm}-test`);
        await mkdir(dest, { recursive: true });
        await copyDirectory(templatePath, dest);

        await rewriteEnvScript(dest, pm);

        const content = readFileSync(join(dest, "scripts", "env.ts"), "utf8");
        expect(content).toContain("npx convex ");
        expect(content).not.toContain("bunx ");
        expect(content).not.toContain("bun scripts/");
      })
    );
  });

  test("rewrites bunx to pnpm dlx for pnpm", async () => {
    const dest = join(tmpDir, "env-script-pnpm-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteEnvScript(dest, "pnpm");

    const content = readFileSync(join(dest, "scripts", "env.ts"), "utf8");
    expect(content).toContain("pnpm dlx convex ");
    expect(content).not.toContain("bunx ");
    expect(content).not.toContain("bun scripts/");
  });

  test("is a no-op for bun", async () => {
    const dest = join(tmpDir, "env-script-bun-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteEnvScript(dest, "bun");

    const scaffolded = readFileSync(join(dest, "scripts", "env.ts"), "utf8");
    const template = readFileSync(
      join(templatePath, "scripts", "env.ts"),
      "utf8"
    );
    expect(scaffolded).toBe(template);
  });

  test("does nothing when scripts/env.ts is absent", async () => {
    const dest = join(tmpDir, "env-script-missing-test");
    await mkdir(dest, { recursive: true });

    await rewriteEnvScript(dest, "npm");

    expect(existsSync(join(dest, "scripts", "env.ts"))).toBe(false);
  });
});

describe("backend convex url sync", () => {
  const backendPackageJson = () =>
    JSON.parse(
      readFileSync(
        join(templatePath, "packages", "backend", "package.json"),
        "utf8"
      )
    );

  test("sync script exists in the template", () => {
    expect(
      existsSync(
        join(
          templatePath,
          "packages",
          "backend",
          "scripts",
          "sync-convex-url.mjs"
        )
      )
    ).toBe(true);
  });

  test("backend dev and setup scripts run the sync", () => {
    const { scripts } = backendPackageJson();
    expect(scripts.dev).toContain(
      "node scripts/sync-convex-url.mjs; convex dev"
    );
    expect(scripts.setup).toContain("node scripts/sync-convex-url.mjs");
  });

  test("sync invocation survives package manager rewrites", () => {
    const { scripts } = backendPackageJson();
    for (const pm of ["npm", "yarn", "pnpm"]) {
      const rewritten = rewriteBunScripts(scripts, pm);
      expect(rewritten.dev).toContain("node scripts/sync-convex-url.mjs");
      expect(rewritten.setup).toContain("node scripts/sync-convex-url.mjs");
    }
  });
});

describe("template desktop app", () => {
  test("pins electron to an exact version for electron-builder", () => {
    const desktop = JSON.parse(
      readFileSync(
        join(templatePath, "apps", "desktop", "package.json"),
        "utf8"
      )
    );
    expect(desktop.devDependencies.electron).toMatch(exactVersionRe);
    expect(desktop.scripts.postinstall).toContain("install-app-deps");
  });

  test("postinstall fails soft so it cannot abort a repair install", () => {
    const desktop = JSON.parse(
      readFileSync(
        join(templatePath, "apps", "desktop", "package.json"),
        "utf8"
      )
    );
    expect(desktop.scripts.postinstall).toContain("install-app-deps || echo ");
  });
});

describe("rewriteBunProse", () => {
  const prose = [
    "This is a Turborepo monorepo managed with **bun** as the package manager.",
    "Run `bun run dev` after `bun install`, or `bunx convex dev`.",
    "- Use `bun` for all package management (not npm/yarn/pnpm)",
    "| Monorepo | [Turborepo](https://turbo.build) + [Bun](https://bun.sh) |",
  ].join("\n");

  test("rewrites commands and package-manager prose for npm", () => {
    const result = rewriteBunProse(prose, "npm");

    expect(result).toContain("managed with **npm** as the package manager");
    expect(result).toContain("`npm run dev`");
    expect(result).toContain("`npm install`");
    expect(result).toContain("`npx convex dev`");
    expect(result).toContain("Use `npm` for all package management");
    expect(result).not.toContain("(not npm/yarn/pnpm)");
    expect(result).toContain("[npm](https://www.npmjs.com)");
    expect(result).not.toContain("bun");
  });

  test("rewrites bunx to pnpm dlx for pnpm", () => {
    const result = rewriteBunProse(prose, "pnpm");

    expect(result).toContain("`pnpm dlx convex dev`");
    expect(result).toContain("`pnpm run dev`");
    expect(result).toContain("[pnpm](https://pnpm.io)");
    expect(result).not.toContain("bun");
  });

  test("rewrites bunx to npx for yarn classic", () => {
    const result = rewriteBunProse(prose, "yarn");

    expect(result).toContain("`npx convex dev`");
    expect(result).toContain("`yarn run dev`");
    expect(result).toContain("[Yarn](https://yarnpkg.com)");
    expect(result).not.toContain("bun");
  });

  test("is a no-op for bun", () => {
    expect(rewriteBunProse(prose, "bun")).toBe(prose);
  });
});

describe("rewriteScaffoldDocs", () => {
  test("rewrites bun commands in the copied agent guide and README.md", async () => {
    const dest = join(tmpDir, "docs-rewrite-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteScaffoldDocs(dest, "npm");

    for (const file of [join(".agents", "AGENTS.md"), "README.md"]) {
      const content = readFileSync(join(dest, file), "utf8");
      expect(content).not.toContain("bun run ");
      expect(content).not.toContain("bun install");
      expect(content).not.toContain("bunx ");
    }
  });

  test("leaves the docs untouched for bun", async () => {
    const dest = join(tmpDir, "docs-noop-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteScaffoldDocs(dest, "bun");

    for (const file of [join(".agents", "AGENTS.md"), "README.md"]) {
      const scaffolded = readFileSync(join(dest, file), "utf8");
      const template = readFileSync(join(templatePath, file), "utf8");
      expect(scaffolded).toBe(template);
    }
  });
});

describe("rewriteBunHooks", () => {
  const hooks = JSON.stringify({
    hooks: {
      PostToolUse: [
        {
          hooks: [{ command: "bun x ultracite fix", type: "command" }],
          matcher: "Write|Edit",
        },
      ],
    },
  });

  test("rewrites bun x to npx for npm and yarn", () => {
    for (const pm of ["npm", "yarn"]) {
      const result = rewriteBunHooks(hooks, pm);
      expect(result).toContain("npx ultracite fix");
      expect(result).not.toContain("bun x ");
    }
  });

  test("rewrites bun x to pnpm exec for pnpm", () => {
    const result = rewriteBunHooks(hooks, "pnpm");
    expect(result).toContain("pnpm exec ultracite fix");
    expect(result).not.toContain("bun x ");
    expect(result).not.toContain("pnpm dlx ");
  });

  test("is a no-op for bun", () => {
    expect(rewriteBunHooks(hooks, "bun")).toBe(hooks);
  });

  test("output stays valid JSON", () => {
    const result = JSON.parse(rewriteBunHooks(hooks, "pnpm"));
    expect(result.hooks.PostToolUse[0].hooks[0].command).toBe(
      "pnpm exec ultracite fix"
    );
  });
});

describe("rewriteClaudeSettings", () => {
  test("rewrites the hook command in the scaffolded settings.json", async () => {
    const dest = join(tmpDir, "settings-rewrite-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteClaudeSettings(dest, "pnpm");

    const settings = JSON.parse(
      readFileSync(join(dest, ".claude", "settings.json"), "utf8")
    );
    const commands = JSON.stringify(settings);
    expect(commands).toContain("pnpm exec biome format --write .");
    expect(commands).not.toContain("bun x ");
  });

  test("leaves settings.json untouched for bun", async () => {
    const dest = join(tmpDir, "settings-noop-test");
    await mkdir(dest, { recursive: true });
    await copyDirectory(templatePath, dest);

    await rewriteClaudeSettings(dest, "bun");

    const scaffolded = readFileSync(
      join(dest, ".claude", "settings.json"),
      "utf8"
    );
    const template = readFileSync(
      join(templatePath, ".claude", "settings.json"),
      "utf8"
    );
    expect(scaffolded).toBe(template);
  });

  test("does nothing when settings.json is absent", async () => {
    const dest = join(tmpDir, "settings-missing-test");
    await mkdir(dest, { recursive: true });

    await rewriteClaudeSettings(dest, "npm");

    expect(existsSync(join(dest, ".claude", "settings.json"))).toBe(false);
  });
});

describe("writePnpmWorkspace", () => {
  test("workspace globs match the template workspaces field", async () => {
    const dest = join(tmpDir, "pnpm-ws-test");
    await mkdir(dest, { recursive: true });

    await writePnpmWorkspace(dest);

    const yaml = readFileSync(join(dest, "pnpm-workspace.yaml"), "utf8");
    const template = JSON.parse(
      readFileSync(join(templatePath, "package.json"), "utf8")
    );

    for (const glob of template.workspaces) {
      expect(yaml).toContain(`- "${glob}"`);
    }
  });

  test("allows the install scripts bun trusts for this tree", async () => {
    const dest = join(tmpDir, "pnpm-scripts-test");
    await mkdir(dest, { recursive: true });

    await writePnpmWorkspace(dest);

    const yaml = readFileSync(join(dest, "pnpm-workspace.yaml"), "utf8");
    expect(yaml).toContain("allowBuilds:");
    expect(yaml).toContain('"@sentry/cli": true');

    const expected = ["esbuild", "keytar", "lefthook", "puppeteer", "sharp"];
    for (const pkg of expected) {
      expect(yaml).toContain(`${pkg}: true`);
    }
  });

  test("skips unreviewed build scripts instead of failing (pnpm 11)", async () => {
    const dest = join(tmpDir, "pnpm-strict-test");
    await mkdir(dest, { recursive: true });

    await writePnpmWorkspace(dest);

    const yaml = readFileSync(join(dest, "pnpm-workspace.yaml"), "utf8");
    expect(yaml).toContain("strictDepBuilds: false");
    expect(yaml).not.toContain("onlyBuiltDependencies");
  });
});

describe("supportedPackageManagers", () => {
  test("includes bun, npm, yarn, pnpm", () => {
    expect(supportedPackageManagers).toContain("bun");
    expect(supportedPackageManagers).toContain("npm");
    expect(supportedPackageManagers).toContain("yarn");
    expect(supportedPackageManagers).toContain("pnpm");
  });

  test("does not include unsupported managers", () => {
    expect(supportedPackageManagers).not.toContain("deno");
    expect(supportedPackageManagers).not.toContain("pip");
  });
});

describe("scaffolding simulation", () => {
  const scaffold = async (name: string) => {
    const projectDir = join(tmpDir, name);
    await mkdir(projectDir, { recursive: true });
    await copyDirectory(templatePath, projectDir);
    await materializeSkills(projectDir);

    const { rename } = await import("node:fs/promises");
    await rename(join(projectDir, "gitignore"), join(projectDir, ".gitignore"));

    await Promise.all(
      dotfileRenames.map(({ dir, from, to }) =>
        rename(join(projectDir, dir, from), join(projectDir, dir, to))
      )
    );

    await createEnvFiles(projectDir);

    return projectDir;
  };

  test("gitignore is renamed to .gitignore", async () => {
    const projectDir = await scaffold("gitignore-test");

    expect(existsSync(join(projectDir, ".gitignore"))).toBe(true);
    expect(existsSync(join(projectDir, "gitignore"))).toBe(false);
  });

  test(".gitignore has content", async () => {
    const projectDir = await scaffold("gitignore-content-test");

    const content = readFileSync(join(projectDir, ".gitignore"), "utf8");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("node_modules");
  });

  test("nested app .gitignore files land dotted, with content", async () => {
    const projectDir = await scaffold("nested-gitignore-test");

    const gitignoreRenames = dotfileRenames.filter(
      (r) => r.from === "gitignore"
    );
    expect(gitignoreRenames.length).toBeGreaterThan(0);

    for (const { dir } of gitignoreRenames) {
      const dotted = join(projectDir, dir, ".gitignore");
      expect(existsSync(dotted)).toBe(true);
      expect(existsSync(join(projectDir, dir, "gitignore"))).toBe(false);
      expect(readFileSync(dotted, "utf8").trim().length).toBeGreaterThan(0);
    }
  });

  test("scaffolded mobile .gitignore already ignores expo-env.d.ts", async () => {
    const projectDir = await scaffold("mobile-gitignore-test");

    const content = readFileSync(
      join(projectDir, "apps", "mobile", ".gitignore"),
      "utf8"
    );
    expect(content).toMatch(expoEnvIgnoreLineRe);
  });

  test("all .env.example files exist after rename", async () => {
    const projectDir = await scaffold("env-example-test");

    const envExampleDirs = dotfileRenames.filter(
      (r) => r.to === ".env.example"
    );
    for (const { dir } of envExampleDirs) {
      expect(existsSync(join(projectDir, dir, ".env.example"))).toBe(true);
    }
  });

  test(".env.local files are created from .env.example", async () => {
    const projectDir = await scaffold("env-local-test");

    const envExampleDirs = dotfileRenames.filter(
      (r) => r.to === ".env.example"
    );
    for (const { dir } of envExampleDirs) {
      const local = readFileSync(join(projectDir, dir, ".env.local"), "utf8");
      const example = readFileSync(
        join(projectDir, dir, ".env.example"),
        "utf8"
      );
      expect(local).toBe(example);
    }
  });

  test("no undotted env files remain after rename", async () => {
    const projectDir = await scaffold("no-undotted-test");

    for (const { dir, from } of dotfileRenames) {
      expect(existsSync(join(projectDir, dir, from))).toBe(false);
    }
  });

  test(".env.example files have content", async () => {
    const projectDir = await scaffold("env-content-test");

    const envExampleDirs = dotfileRenames.filter(
      (r) => r.to === ".env.example"
    );
    for (const { dir } of envExampleDirs) {
      const content = readFileSync(
        join(projectDir, dir, ".env.example"),
        "utf8"
      );
      expect(content.length).toBeGreaterThan(0);
    }
  });

  test(".env.production files are created from .env.example", async () => {
    const projectDir = await scaffold("env-setup-test");

    const envExampleDirs = dotfileRenames
      .filter((r) => r.to === ".env.example")
      .map((r) => r.dir);

    for (const dir of envExampleDirs) {
      expect(existsSync(join(projectDir, dir, ".env.production"))).toBe(true);
    }
  });

  test("dev-only files can be stripped", async () => {
    const projectDir = await scaffold("dev-strip-test");

    await Promise.all(
      devOnlyFiles.map(async (file) => {
        await mkdir(join(projectDir, dirname(file)), { recursive: true });
        await writeFile(join(projectDir, file), "{}\n");
      })
    );

    await Promise.all(
      devOnlyFiles.map((file) =>
        rm(join(projectDir, file), { force: true, recursive: true })
      )
    );

    for (const file of devOnlyFiles) {
      expect(existsSync(join(projectDir, file))).toBe(false);
    }
  });

  test("agent files land in the scaffold, local settings stripped", async () => {
    const projectDir = await scaffold("agent-files-test");

    await Promise.all(
      devOnlyFiles.map((file) =>
        rm(join(projectDir, file), { force: true, recursive: true })
      )
    );

    expect(existsSync(join(projectDir, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(projectDir, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(projectDir, ".mcp.json"))).toBe(true);
    expect(existsSync(join(projectDir, ".claude", "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(projectDir, ".agents", "AGENTS.md"))).toBe(true);
    expect(existsSync(join(projectDir, ".claude", "settings.json"))).toBe(true);
    expect(existsSync(join(projectDir, ".claude", "settings.local.json"))).toBe(
      false
    );
  });

  test("skills are materialized as real directories in .claude/skills", async () => {
    const projectDir = await scaffold("skills-test");
    const skillsSourceDir = join(projectDir, ".agents", "skills");
    const skillsDestDir = join(projectDir, ".claude", "skills");

    const sourceSkills = readdirSync(skillsSourceDir).sort();
    const materializedSkills = readdirSync(skillsDestDir).sort();
    expect(materializedSkills).toEqual(sourceSkills);
    expect(materializedSkills.length).toBeGreaterThan(0);

    for (const skill of materializedSkills) {
      const skillPath = join(skillsDestDir, skill);
      expect(lstatSync(skillPath).isSymbolicLink()).toBe(false);
      expect(statSync(skillPath).isDirectory()).toBe(true);
    }

    expect(
      existsSync(join(skillsDestDir, materializedSkills[0], "SKILL.md"))
    ).toBe(true);
  });

  test("project has expected top-level structure", async () => {
    const projectDir = await scaffold("structure-test");

    const entries = readdirSync(projectDir);
    expect(entries).toContain(".gitignore");
    expect(entries).toContain("package.json");
    expect(entries).toContain("turbo.json");
    expect(entries).toContain("apps");
    expect(entries).toContain("packages");
    expect(entries).toContain(".github");
  });

  test("no node_modules copied", async () => {
    const projectDir = await scaffold("no-modules-test");

    expect(existsSync(join(projectDir, "node_modules"))).toBe(false);

    const apps = readdirSync(join(projectDir, "apps"));
    for (const app of apps) {
      const appPath = join(projectDir, "apps", app);
      if (statSync(appPath).isDirectory()) {
        expect(existsSync(join(appPath, "node_modules"))).toBe(false);
      }
    }
  });

  test("package.json name can be updated", async () => {
    const projectDir = await scaffold("name-update-test");
    await updatePackageJson(projectDir, "my-saas");

    const content = JSON.parse(
      readFileSync(join(projectDir, "package.json"), "utf8")
    );
    expect(content.name).toBe("my-saas");
  });

  test("bun config: bunfig.toml preserved", async () => {
    const projectDir = await scaffold("bun-config-test");
    expect(existsSync(join(projectDir, "bunfig.toml"))).toBe(true);
  });

  test("non-bun config: bunfig.toml removable", async () => {
    const projectDir = await scaffold("non-bun-test");
    await rm(join(projectDir, "bunfig.toml"), { force: true });
    expect(existsSync(join(projectDir, "bunfig.toml"))).toBe(false);
  });

  test("pnpm files removable for non-pnpm managers", async () => {
    const projectDir = await scaffold("pnpm-cleanup-test");

    await rm(join(projectDir, "pnpm-lock.yaml"), { force: true });
    await rm(join(projectDir, "pnpm-workspace.yaml"), { force: true });

    expect(existsSync(join(projectDir, "pnpm-lock.yaml"))).toBe(false);
    expect(existsSync(join(projectDir, "pnpm-workspace.yaml"))).toBe(false);
  });
});

describe("edge cases", () => {
  test("env.example exists and has content for each dir (no env.local)", () => {
    const dirs = dotfileRenames
      .filter((r) => r.from === "env.example")
      .map((r) => r.dir);

    for (const dir of dirs) {
      const exampleContent = readFileSync(
        join(templatePath, dir, "env.example"),
        "utf8"
      );
      expect(exampleContent.length).toBeGreaterThan(0);
      expect(existsSync(join(templatePath, dir, "env.local"))).toBe(false);
    }
  });

  test("copyExclusions does not block dotenv files", () => {
    expect(copyExclusions.has(".env.example")).toBe(false);
    expect(copyExclusions.has("env.example")).toBe(false);
  });

  test("devOnlyFiles does not include env files", () => {
    for (const file of devOnlyFiles) {
      expect(file).not.toContain("env");
    }
  });

  test("template package.json has env scripts", () => {
    const content = JSON.parse(
      readFileSync(join(templatePath, "package.json"), "utf8")
    );
    expect(content.scripts["env:init"]).toBeUndefined();
    expect(content.scripts["env:check"]).toBeDefined();
    expect(content.scripts["env:push"]).toBeDefined();
  });
});

describe("name prompt", () => {
  const source = readFileSync(join(import.meta.dirname, "init.ts"), "utf8");
  const getNameSource = source.slice(
    source.indexOf("const getName"),
    source.indexOf("const getPackageManager")
  );

  test("Enter accepts the rendered my-app default", () => {
    expect(getNameSource).toContain('defaultValue: "my-app"');
  });

  test("placeholder matches the default so the display is honest", () => {
    expect(getNameSource).toContain('placeholder: "my-app"');
  });

  test("no validator rejects the empty input the default exists for", () => {
    expect(getNameSource).not.toContain("validate(");
    expect(getNameSource).not.toContain("validate:");
  });
});

describe("init step ordering", () => {
  const source = readFileSync(join(import.meta.dirname, "init.ts"), "utf8");

  const orderOf = (marker: string): number => {
    const index = source.indexOf(marker);
    expect(`${marker} @ ${index}`).not.toBe(`${marker} @ -1`);
    return index;
  };

  test("git init runs before install so hooks can register", () => {
    expect(orderOf("await initGitRepo()")).toBeLessThan(
      orderOf("await installDependencies(")
    );
  });

  test("renames and env files happen before the commit", () => {
    const commit = orderOf('await run("git add .")');
    expect(orderOf("dotfileRenames.map")).toBeLessThan(commit);
    expect(orderOf("await createEnvFiles(")).toBeLessThan(commit);
  });

  test("lockfile convergence reinstall sits between install and commit", () => {
    const converge = orderOf('await run("bun install")');

    expect(orderOf("await installDependencies(")).toBeLessThan(converge);
    expect(converge).toBeLessThan(orderOf('await run("git add .")'));
  });

  test("convergence reinstall is guarded to bun", () => {
    const between = source.slice(
      orderOf("await setupConvex("),
      orderOf('await run("git add .")')
    );

    expect(between).toContain('if (packageManager === "bun")');
    expect(between).toContain('await run("bun install")');
  });

  test("commit is the last side-effecting step", () => {
    const add = orderOf('await run("git add .")');
    const commit = orderOf("commit --no-verify");

    expect(orderOf("await installDependencies(")).toBeLessThan(add);
    expect(orderOf("await setupConvex(")).toBeLessThan(add);
    expect(add).toBeLessThan(commit);

    const tail = source.slice(commit);
    for (const sideEffect of [
      "await run(",
      "await rename(",
      "await rm(",
      "await writeFile(",
      "installDependencies(",
      "setupConvex(",
    ]) {
      expect(tail.indexOf(sideEffect)).toBe(-1);
    }
  });
});
