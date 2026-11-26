import { bnBeginner } from "./bn-beginner.js";
import { bnInvesting } from "./bn-investing.js";
import { bnScamAwareness } from "./bn-scam-awareness.js";
import { bnTaxesSavings } from "./bn-taxes-savings.js";
import { hiBeginner } from "./hi-beginner.js";
import { hiInvesting } from "./hi-investing.js";
import { hiScamAwareness } from "./hi-scam-awareness.js";
import { hiTaxesSavings } from "./hi-taxes-savings.js";
import { taBeginner } from "./ta-beginner.js";
import { taInvesting } from "./ta-investing.js";
import { taScamAwareness } from "./ta-scam-awareness.js";
import { taTaxesSavings } from "./ta-taxes-savings.js";
import { teBeginner } from "./te-beginner.js";
import { teInvesting } from "./te-investing.js";
import { teScamAwareness } from "./te-scam-awareness.js";
import { teTaxesSavings } from "./te-taxes-savings.js";
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
  ta: {
    beginner: taBeginner,
    investing: taInvesting,
    "taxes-and-savings": taTaxesSavings,
    "scam-awareness": taScamAwareness,
  },
  te: {
    beginner: teBeginner,
    investing: teInvesting,
    "taxes-and-savings": teTaxesSavings,
    "scam-awareness": teScamAwareness,
  },
  bn: {
    beginner: bnBeginner,
    investing: bnInvesting,
    "taxes-and-savings": bnTaxesSavings,
    "scam-awareness": bnScamAwareness,
  },
};