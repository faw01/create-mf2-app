type ImportMetaGlob = (
  pattern: string
) => Record<string, () => Promise<unknown>>;

export const modules = (
  import.meta as unknown as { glob: ImportMetaGlob }
).glob("./**/*.ts");
