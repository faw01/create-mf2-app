import { type SpawnOptions, spawn } from "node:child_process";
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

export const run = (command: string, options?: SpawnOptions): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: "ignore",
      ...options,
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command}`));
      }
    });
    child.on("error", reject);
  });

export const supportedPackageManagers = ["bun", "npm", "yarn", "pnpm"];

export const devOnlyFiles = [join(".claude", "settings.local.json")];

export const copyExclusions = new Set([
  "node_modules",
  ".DS_Store",
  ".turbo",
  ".expo",
  "ios",
  "android",
  "bun.lock",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  ".git",
  ".next",
  ".cache",
  ".vercel",
  ".react-email",
  "dist",
  "out",
  "storybook-static",
  ".env",
  ".env.local",
  ".env.production",
]);

// npm pack unconditionally drops files named .gitignore, so the template
// stores these un-dotted and the CLI renames them at scaffold time. Nested
// gitignores must be listed here or published scaffolds silently lose them.
export const dotfileRenames = [
  { dir: join("apps", "api"), from: "env.example", to: ".env.example" },
  { dir: join("apps", "app"), from: "env.example", to: ".env.example" },
  { dir: join("apps", "web"), from: "env.example", to: ".env.example" },
  { dir: join("packages", "cms"), from: "env.example", to: ".env.example" },
  {
    dir: join("packages", "internationalization"),
    from: "env.example",
    to: ".env.example",
  },
  { dir: join("apps", "mobile"), from: "env.example", to: ".env.example" },
  { dir: join("apps", "api"), from: "gitignore", to: ".gitignore" },
  { dir: join("apps", "app"), from: "gitignore", to: ".gitignore" },
  { dir: join("apps", "desktop"), from: "gitignore", to: ".gitignore" },
  { dir: join("apps", "mobile"), from: "gitignore", to: ".gitignore" },
  { dir: join("apps", "web"), from: "gitignore", to: ".gitignore" },
];

export const getTemplatePath = (): string => {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolvePath(currentDir, "..", "template");
};

export const copyDirectory = async (
  source: string,
  destination: string
): Promise<void> => {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  await Promise.all(
    entries.flatMap((entry) => {
      if (copyExclusions.has(entry.name)) {
        return [];
      }

      const srcPath = join(source, entry.name);
      const destPath = join(destination, entry.name);

      if (entry.isDirectory()) {
        return [copyDirectory(srcPath, destPath)];
      }
      if (entry.isFile()) {
        return [copyFile(srcPath, destPath)];
      }
      return [];
    })
  );
};

export const materializeSkills = async (projectDir: string): Promise<void> => {
  const skillsSourceDir = join(projectDir, ".agents", "skills");
  const skillsDestDir = join(projectDir, ".claude", "skills");

  try {
    await stat(skillsSourceDir);
  } catch {
    return;
  }

  await rm(skillsDestDir, { force: true, recursive: true });
  await copyDirectory(skillsSourceDir, skillsDestDir);
};

export const updatePackageJson = async (
  projectDir: string,
  name: string
): Promise<void> => {
  const packageJsonPath = join(projectDir, "package.json");
  const content = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(content);

  packageJson.name = name;

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

export const updatePackageManager = async (
  projectDir: string,
  packageManager: string
): Promise<void> => {
  const packageJsonPath = join(projectDir, "package.json");
  const content = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(content);

  const versions: Record<string, string> = {
    npm: "npm@11.18.0",
    pnpm: "pnpm@11.9.0",
    yarn: "yarn@1.22.22",
  };

  if (versions[packageManager]) {
    packageJson.packageManager = versions[packageManager];
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

export const convertWorkspaceDeps = async (filePath: string): Promise<void> => {
  const content = await readFile(filePath, "utf8");
  const packageJson = JSON.parse(content);

  for (const depType of ["dependencies", "devDependencies"]) {
    const deps = packageJson[depType];
    if (!deps) {
      continue;
    }

    for (const [dep, version] of Object.entries(deps)) {
      if (version === "workspace:*") {
        deps[dep] = "*";
      }
    }
  }

  await writeFile(filePath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

const listPackageJsonPaths = async (projectDir: string): Promise<string[]> => {
  const workspaceGroups = await Promise.all(
    ["apps", "packages"].map(async (dir) => {
      const dirPath = join(projectDir, dir);

      let packages: string[];
      try {
        packages = await readdir(dirPath);
      } catch {
        return [];
      }

      const candidates = await Promise.all(
        packages.map(async (pkg) => {
          const pkgJsonPath = join(dirPath, pkg, "package.json");
          try {
            await stat(pkgJsonPath);
            return [pkgJsonPath];
          } catch {
            return [];
          }
        })
      );

      return candidates.flat();
    })
  );

  return [join(projectDir, "package.json"), ...workspaceGroups.flat()];
};

export const convertAllWorkspaceDeps = async (
  projectDir: string
): Promise<void> => {
  const paths = await listPackageJsonPaths(projectDir);
  await Promise.all(paths.map((path) => convertWorkspaceDeps(path)));
};

// Non-bun scaffolds need tsx to run the TS scripts bun executes natively;
// a real devDependency makes npx/pnpm use the lockfile-pinned binary.
export const tsxVersion = "^4.23.0";

const bunScriptReplacements: Record<string, [string, string][]> = {
  npm: [
    ["bunx --bun ", "npx "],
    ["bunx ", "npx "],
    ["bun --bun ", ""],
    ["bun install", "npm install"],
    ["bun scripts/", "npx tsx scripts/"],
    ["-p bun", "-p npm"],
  ],
  pnpm: [
    ["bunx --bun ", "pnpm dlx "],
    ["bunx ", "pnpm dlx "],
    ["bun --bun ", ""],
    ["bun install", "pnpm install"],
    ["bun scripts/", "pnpm exec tsx scripts/"],
    ["-p bun", "-p pnpm"],
  ],
  yarn: [
    ["bunx --bun ", "npx "],
    ["bunx ", "npx "],
    ["bun --bun ", ""],
    ["bun install", "yarn install"],
    ["bun scripts/", "npx tsx scripts/"],
    ["-p bun", "-p yarn"],
  ],
};

export const rewriteBunTokens = (
  content: string,
  packageManager: string
): string => {
  const replacements = bunScriptReplacements[packageManager];
  if (!replacements) {
    return content;
  }

  let next = content;
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }

  return next;
};

export const rewriteBunScripts = (
  scripts: Record<string, string>,
  packageManager: string
): Record<string, string> => {
  if (!bunScriptReplacements[packageManager]) {
    return scripts;
  }

  const rewritten: Record<string, string> = {};
  for (const [name, command] of Object.entries(scripts)) {
    rewritten[name] = rewriteBunTokens(command, packageManager);
  }

  return rewritten;
};

export const addTsxDevDependency = async (
  projectDir: string
): Promise<void> => {
  const packageJsonPath = join(projectDir, "package.json");
  const content = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(content);

  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    tsx: tsxVersion,
  };

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

export const rewriteEnvScript = async (
  projectDir: string,
  packageManager: string
): Promise<void> => {
  const path = join(projectDir, "scripts", "env.ts");

  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch {
    return;
  }

  await writeFile(path, rewriteBunTokens(content, packageManager));
};

export const rewriteAllBunScripts = async (
  projectDir: string,
  packageManager: string
): Promise<void> => {
  const paths = await listPackageJsonPaths(projectDir);

  await Promise.all(
    paths.map(async (path) => {
      const content = await readFile(path, "utf8");
      const packageJson = JSON.parse(content);

      if (!packageJson.scripts) {
        return;
      }

      packageJson.scripts = rewriteBunScripts(
        packageJson.scripts,
        packageManager
      );

      await writeFile(path, `${JSON.stringify(packageJson, null, 2)}\n`);
    })
  );
};

const packageManagerLinks: Record<string, string> = {
  npm: "[npm](https://www.npmjs.com)",
  pnpm: "[pnpm](https://pnpm.io)",
  yarn: "[Yarn](https://yarnpkg.com)",
};

export const rewriteBunProse = (
  content: string,
  packageManager: string
): string => {
  const bunLink = packageManagerLinks[packageManager];
  if (!bunLink) {
    return content;
  }

  const exec = packageManager === "pnpm" ? "pnpm dlx " : "npx ";
  const replacements: [string, string][] = [
    ["bunx --bun ", exec],
    ["bunx ", exec],
    ["bun install", `${packageManager} install`],
    ["bun run ", `${packageManager} run `],
    [
      "Use `bun` for all package management (not npm/yarn/pnpm)",
      `Use \`${packageManager}\` for all package management`,
    ],
    [
      "Use `bun` for all package management",
      `Use \`${packageManager}\` for all package management`,
    ],
    [
      "managed with **bun** as the package manager",
      `managed with **${packageManager}** as the package manager`,
    ],
    ["[Bun](https://bun.sh)", bunLink],
  ];

  let next = content;
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }

  return next;
};

export const rewriteScaffoldDocs = async (
  projectDir: string,
  packageManager: string
): Promise<void> => {
  // Root CLAUDE.md and AGENTS.md just import .agents/AGENTS.md, which is
  // where the bun prose actually lives.
  await Promise.all(
    [join(".agents", "AGENTS.md"), "README.md"].map(async (file) => {
      const path = join(projectDir, file);

      let content: string;
      try {
        content = await readFile(path, "utf8");
      } catch {
        return;
      }

      await writeFile(path, rewriteBunProse(content, packageManager));
    })
  );
};

export const rewriteBunHooks = (
  content: string,
  packageManager: string
): string => {
  // Hooks run a locally pinned devDependency. npx resolves node_modules/.bin
  // first; pnpm needs `exec`, not `dlx`, which always fetches registry-latest
  // and ignores the pinned version.
  const execs: Record<string, string> = {
    npm: "npx ",
    pnpm: "pnpm exec ",
    yarn: "npx ",
  };

  const exec = execs[packageManager];
  if (!exec) {
    return content;
  }

  let next = content;
  for (const from of ["bun x ", "bunx --bun ", "bunx "]) {
    next = next.replaceAll(from, exec);
  }

  return next;
};

export const rewriteClaudeSettings = async (
  projectDir: string,
  packageManager: string
): Promise<void> => {
  const path = join(projectDir, ".claude", "settings.json");

  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch {
    return;
  }

  await writeFile(path, rewriteBunHooks(content, packageManager));
};

export const writePnpmWorkspace = async (projectDir: string): Promise<void> => {
  const contents = `packages:
  - "apps/*"
  - "packages/*"

strictDepBuilds: false

allowBuilds:
  "@sentry/cli": true
  "@tailwindcss/oxide": true
  bufferutil: true
  electron: true
  electron-winstaller: true
  esbuild: true
  keytar: true
  lefthook: true
  puppeteer: true
  sharp: true
  utf-8-validate: true
`;

  await writeFile(join(projectDir, "pnpm-workspace.yaml"), contents);
};

export const addWorkspacesField = async (projectDir: string): Promise<void> => {
  const packageJsonPath = join(projectDir, "package.json");
  const content = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(content);

  packageJson.workspaces = ["apps/*", "packages/*"];

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

// The scaffold ships ready-to-fill env files so no manual env command is
// needed before `dev`. Blank values are safe: every env schema treats empty
// strings as undefined, which just disables that integration.
export const createEnvFiles = async (projectDir: string): Promise<void> => {
  await Promise.all(
    ["apps", "packages"].map(async (dir) => {
      const base = join(projectDir, dir);

      let entries: string[];
      try {
        entries = await readdir(base);
      } catch {
        return;
      }

      await Promise.all(
        entries.map(async (entry) => {
          const examplePath = join(base, entry, ".env.example");

          try {
            await stat(examplePath);
          } catch {
            return;
          }

          await Promise.all(
            [".env.local", ".env.production"].map((target) =>
              copyFile(examplePath, join(base, entry, target))
            )
          );
        })
      );
    })
  );
};
