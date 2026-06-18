import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Electron 42+ no longer downloads its binary at install time; the first
// `require("electron")` does. electron-vite does not require electron, it
// resolves path.txt itself and dies with "Error: Electron uninstall" when the
// binary is absent, taking the whole `turbo dev` session down with it. The
// desktop postinstall normally downloads the binary; this guard covers the
// states where that step failed (offline or interrupted install) by skipping
// with one clear line instead of crashing dev for every other app.

const require = createRequire(import.meta.url);

// Mirrors electron-vite's getElectronPath check without requiring electron,
// because requiring it would start a download as a side effect.
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
  stdio: "inherit",
  shell: process.platform === "win32",
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    dev.kill(signal);
  });
}

dev.on("exit", (code) => {
  process.exit(code ?? 0);
});
