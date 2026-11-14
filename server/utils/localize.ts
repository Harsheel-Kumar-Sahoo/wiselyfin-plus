export type Lang = "en" | "hi" | "ta" | "te" | "bn";

const LANGS: Lang[] = ["en", "hi", "ta", "te", "bn"];

type Text = { en: string } & Partial<Record<Lang, string | null>>;

export function parseLang(value: unknown): Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value) ? (value as Lang) : "en";
}

// Picks the text in the chosen language, and falls back to English if it is empty.
export function pick(text: Text | null | undefined, lang: Lang): string {
  if (!text) return "";
  const value = text[lang];
  return value && value.trim() ? value : text.en;
}