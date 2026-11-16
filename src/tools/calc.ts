import { CESS_PERCENT, type RegimeConfig } from "./taxConfig";

// All calculators are plain functions. They change nothing and call no server.

export type YearPoint = { year: number; invested: number; value: number };

// SIP: a fixed amount invested at the end of every month.
export function sip(monthly: number, annualRatePercent: number, years: number) {
  const r = annualRatePercent / 100 / 12;
  const n = Math.round(years * 12);
  let balance = 0;
  const points: YearPoint[] = [];
  for (let m = 1; m <= n; m += 1) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0 || m === n) {
      points.push({ year: Math.ceil(m / 12), invested: monthly * m, value: balance });
    }
  }
  const invested = monthly * n;
  return { invested, value: balance, gain: balance - invested, points };
}

// EMI: the fixed monthly payment of a loan.
export function emi(principal: number, annualRatePercent: number, years: number) {
  const r = annualRatePercent / 100 / 12;
  const n = Math.round(years * 12);
  const payment = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = payment * n;
  return { payment, total, interest: total - principal, months: n };
}

// Compound interest: interest is added to the money and then earns interest too.
export function compound(principal: number, annualRatePercent: number, years: number, timesPerYear: number) {
  const r = annualRatePercent / 100;
  const points: YearPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y += 1) {
    const t = Math.min(y, years);
    points.push({ year: y, invested: principal, value: principal * Math.pow(1 + r / timesPerYear, timesPerYear * t) });
  }
  const value = principal * Math.pow(1 + r / timesPerYear, timesPerYear * years);
  return { invested: principal, value, gain: value - principal, points };
}

// Fixed deposit with interest added every quarter (the usual rule for Indian bank FDs).
export function fd(principal: number, annualRatePercent: number, years: number) {
  return compound(principal, annualRatePercent, years, 4);
}

// Recurring deposit: a fixed amount every month, with interest added every quarter.
export function rd(monthly: number, annualRatePercent: number, months: number) {
  const r = annualRatePercent / 100;
  let value = 0;
  for (let i = 1; i <= months; i += 1) {
    const remainingYears = (months - i + 1) / 12;
    value += monthly * Math.pow(1 + r / 4, 4 * remainingYears);
  }
  const invested = monthly * months;
  return { invested, value, gain: value - invested };
}

export type TaxLine = { from: number; to: number | null; rate: number; amount: number; tax: number };

// Income tax for one regime. Takes yearly gross income and (for the old regime) deductions.
export function incomeTax(grossIncome: number, deductions: number, regime: RegimeConfig) {
  const taxable = Math.max(0, grossIncome - regime.standardDeduction - Math.max(0, deductions));
  const lines: TaxLine[] = [];
  let previous = 0;
  let tax = 0;

  for (const slab of regime.slabs) {
    const top = slab.upTo ?? Number.POSITIVE_INFINITY;
    const amount = Math.max(0, Math.min(taxable, top) - previous);
    const slabTax = (amount * slab.rate) / 100;
    lines.push({ from: previous, to: slab.upTo, rate: slab.rate, amount, tax: slabTax });
    tax += slabTax;
    previous = top;
    if (taxable <= top) break;
  }

  let rebate = 0;
  if (taxable <= regime.rebateLimit) rebate = Math.min(tax, regime.rebateMax);
  const afterRebate = tax - rebate;
  const cess = (afterRebate * CESS_PERCENT) / 100;
  return { taxable, lines, tax, rebate, cess, total: afterRebate + cess };
}