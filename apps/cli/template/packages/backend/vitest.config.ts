import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dangerouslyIgnoreUnhandledErrors: true,
    environment: "edge-runtime",
    passWithNoTests: true,
    server: { deps: { inline: ["convex-test"] } },
  },
});
