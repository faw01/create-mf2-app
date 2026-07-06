import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dangerouslyIgnoreUnhandledErrors: true,
    environment: "edge-runtime",
    // The template ships no backend tests; scaffolds add their own.
    passWithNoTests: true,
    server: { deps: { inline: ["convex-test"] } },
  },
});
