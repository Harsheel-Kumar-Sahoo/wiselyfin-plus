// INCOME TAX SETTINGS. Edit only this file when the rules change.
//
// IMPORTANT: These numbers are a starting point written by an AI assistant.
// Check EVERY value against the official Income Tax Department website
// (incometax.gov.in) before you launch, and again each financial year.
// Results shown to users are educational, not financial or tax advice.

export type Slab = {
  upTo: number | null; // upper limit of this slab in rupees; null means no upper limit
  rate: number; // tax rate as a percent
};

export type RegimeConfig = {
  id: "new" | "old";
  label: string;
  standardDeduction: number;
  slabs: Slab[];
  // Tax rebate under section 87A: if taxable income is up to this limit, tax becomes zero.
  rebateLimit: number;
  rebateMax: number;
};

export const TAX_YEAR_LABEL = "FY 2025-26 (verify on incometax.gov.in)";
export const CESS_PERCENT = 4; // health and education cess on the tax

export const NEW_REGIME: RegimeConfig = {
  id: "new",
  label: "New regime",
  standardDeduction: 75000,
  slabs: [
    { upTo: 400000, rate: 0 },
    { upTo: 800000, rate: 5 },
    { upTo: 1200000, rate: 10 },
    { upTo: 1600000, rate: 15 },
    { upTo: 2000000, rate: 20 },
    { upTo: 2400000, rate: 25 },
    { upTo: null, rate: 30 },
  ],
  rebateLimit: 1200000,
  rebateMax: 60000,
};

export const OLD_REGIME: RegimeConfig = {
  id: "old",
  label: "Old regime",
  standardDeduction: 50000,
  slabs: [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 5 },
    { upTo: 1000000, rate: 20 },
    { upTo: null, rate: 30 },
  ],
  rebateLimit: 500000,
  rebateMax: 12500,
};

// Surcharge and other special cases are NOT included in this simple calculator.