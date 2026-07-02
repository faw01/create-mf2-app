import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    dangerouslyIgnoreUnhandledErrors: true,
    // The template ships no backend tests; scaffolds add their own.
    passWithNoTests: true,
  },
});
