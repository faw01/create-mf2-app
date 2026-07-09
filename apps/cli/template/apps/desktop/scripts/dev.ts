import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

const electronBinaryExists = (): boolean => {
  try {
    const electronDir = dirname(require.resolve("electron/package.json"));
    const pathFile = join(electronDir, "path.txt");
    if (!existsSync(pathFile)) {
      return false;
    }
    return existsSync(
      join(electronDir, "dist", readFileSync(pathFile, "utf8"))
    );
  } catch {
    return false;
  }
};

if (!electronBinaryExists()) {
  console.log(
    "Skipping desktop: Electron binary is missing. Heal it, then rerun dev: cd apps/desktop && node -e \"require('electron')\""
  );
  process.exit(0);
}

const dev = spawn("electron-vite", ["dev"], {
  shell: process.platform === "win32",
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    dev.kill(signal);
  });
}

dev.on("exit", (code) => {
  process.exit(code ?? 0);
});
