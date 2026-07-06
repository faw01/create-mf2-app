import { defineConfig } from "tsup";

export default defineConfig({
  banner: { js: "#!/usr/bin/env node" },
  dts: false,
  entry: ["scripts/index.ts"],
  format: ["esm"],
  minify: true,
  noExternal: ["@clack/prompts", "@clack/core", "sisteransi", "picocolors"],
  outDir: "dist",
  sourcemap: false,
});
