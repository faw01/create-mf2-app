// Vitest (via Vite) provides import.meta.glob at runtime. The cast keeps
// tsc happy without vite's client types, which are not a dependency here.
// The Convex CLI never pushes this file (filenames with multiple dots are
// skipped), but the typecheck it runs on every push still compiles it.
type ImportMetaGlob = (
  pattern: string
) => Record<string, () => Promise<unknown>>;

export const modules = (
  import.meta as unknown as { glob: ImportMetaGlob }
).glob("./**/*.ts");
