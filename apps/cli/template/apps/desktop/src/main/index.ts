import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { autoUpdater } from "electron-updater";
import icon from "../../resources/icon.png?asset";

function openExternalUrl(url: string): void {
  if (URL.canParse(url) && new URL(url).protocol === "https:") {
    shell.openExternal(url);
  }
}

function hasRealUpdateFeed(): boolean {
  if (!app.isPackaged) {
    return false;
  }
  const feedConfigPath = join(process.resourcesPath, "app-update.yml");
  if (!existsSync(feedConfigPath)) {
    return false;
  }
  const feedConfig = readFileSync(feedConfigPath, "utf8");
  return !feedConfig.includes("your-github-username");
}

function startUpdateCheck(): void {
  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error("Update check failed", error);
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 800,
    show: false,
    width: 1200,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.js"),
      sandbox: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    openExternalUrl(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(import.meta.dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.mf2.desktop");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("open-external", (_event, url: string) => {
    openExternalUrl(url);
  });

  createWindow();

  if (hasRealUpdateFeed()) {
    startUpdateCheck();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
