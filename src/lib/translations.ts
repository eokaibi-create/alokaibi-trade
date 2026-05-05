import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ar from "@/locales/ar.json";

const locales = { en, zh, ar } as const;
export type Locale = keyof typeof locales;
export type TranslationKeys = typeof en;

export function getTranslations(locale: string): TranslationKeys {
  return (locales as any)[locale] || en;
}

export function getLocaleFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/(en|zh|ar)/);
  return (match?.[1] as Locale) || "en";
}
