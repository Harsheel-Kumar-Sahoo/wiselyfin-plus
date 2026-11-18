import crypto from "node:crypto";
import { MARKET_PROVIDER, QUOTE_TTL_SECONDS, STOCKS, type StockDef } from "../config/market.js";
import { cached } from "./cache.js";

export type Quote = {
  symbol: string;
  name: string;
  pricePaise: number;
  source: "delayed" | "simulated";
};

export type QuoteBook = { asOf: string; quotes: Record<string, Quote> };

// A believable price that moves slowly and changes every 15 minutes. Same input, same output.
function simulatedPaise(stock: StockDef): number {
  const bucket = Math.floor(Date.now() / (QUOTE_TTL_SECONDS * 1000));
  const hash = crypto.createHash("sha256").update(`${stock.symbol}:${bucket}`).digest();
  const noise = ((hash.readUInt16BE(0) % 2001) - 1000) / 1000; // -1 to 1
  const seed = hash.readUInt8(31) / 255;
  const drift = Math.sin(bucket / 200 + stock.symbol.length + seed * 0.001) * 0.05;
  return Math.max(100, Math.round(stock.basePrice * (1 + drift + noise * 0.01) * 100));
}

// Asks the public price feed for one share. Returns null on any problem.
async function fetchDelayedPaise(stock: StockDef): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.yahoo)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WiselyFinPlus/1.0)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number } }> } };
    const price = json.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return null;
    return Math.round(price * 100);
  } catch {
    return null;
  }
}

async function buildBook(): Promise<QuoteBook> {
  const quotes: Record<string, Quote> = {};

  const live =
    MARKET_PROVIDER === "yahoo"
      ? await Promise.all(STOCKS.map((s) => fetchDelayedPaise(s)))
      : STOCKS.map(() => null);

  STOCKS.forEach((stock, i) => {
    const delayed = live[i] ?? null;
    quotes[stock.symbol] = {
      symbol: stock.symbol,
      name: stock.name,
      pricePaise: delayed ?? simulatedPaise(stock),
      source: delayed !== null ? "delayed" : "simulated",
    };
  });

  return { asOf: new Date().toISOString(), quotes };
}

// All prices, saved for 15 minutes so many users cost one outside call.
// This never throws: if the feed is down, simulated prices are used.
export async function getQuoteBook(): Promise<QuoteBook> {
  return cached<QuoteBook>("market:quotes", QUOTE_TTL_SECONDS, buildBook);
}