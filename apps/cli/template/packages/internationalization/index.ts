import "server-only";
import type en from "./dictionaries/en.json";
import languine from "./languine.json" with { type: "json" };

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof en;

const loadEnglishDictionary = (): Promise<Dictionary> =>
  import("./dictionaries/en.json").then((mod) => mod.default);

const dictionaries: Record<string, () => Promise<Dictionary>> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      () =>
        import(`./dictionaries/${locale}.json`)
          .then((mod) => mod.default)
          .catch(loadEnglishDictionary),
    ])
  );

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const [normalizedLocale] = locale.split("-");

  if (!locales.includes(normalizedLocale as (typeof locales)[number])) {
    return dictionaries.en();
  }

  try {
    return await dictionaries[normalizedLocale]();
  } catch {
    return dictionaries.en();
  }
};
