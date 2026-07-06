import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@repo": resolve("../../packages"),
      },
    },
  },
  preload: {},
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@repo": resolve("../../packages"),
      },
    },
  },
});
