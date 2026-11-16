// Formats rupee amounts with Indian digit grouping, for example 12,34,567.
export function inr(value: number, language: string): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat(language === "en" ? "en-IN" : `${language}-IN`, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safe);
}

// Turns what the user typed into a number. Returns null if it is not a number above zero.
export function positive(text: string): number | null {
  const n = Number(text.replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}