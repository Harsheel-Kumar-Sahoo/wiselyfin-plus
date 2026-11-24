import { hiBeginner } from "./hi-beginner.js";
import { hiInvesting } from "./hi-investing.js";
import { hiScamAwareness } from "./hi-scam-awareness.js";
import { hiTaxesSavings } from "./hi-taxes-savings.js";
import type { PathTranslation } from "./types.js";

export const LANGS = ["hi", "ta", "te", "bn"] as const;
export type TransLang = (typeof LANGS)[number];

// The key of each path is its slug. Add each new translation file here.
export const translations: Record<TransLang, Record<string, PathTranslation>> = {
  hi: {
    beginner: hiBeginner,
    investing: hiInvesting,
    "taxes-and-savings": hiTaxesSavings,
    "scam-awareness": hiScamAwareness,
  },
  ta: {},
  te: {},
  bn: {},
};