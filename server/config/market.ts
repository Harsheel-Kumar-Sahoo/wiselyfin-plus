// Easy-to-edit market settings. Change a value here and redeploy.

// "yahoo" tries the delayed public price feed first and falls back to simulated prices.
// "simulated" never calls the internet and always uses simulated prices.
export const MARKET_PROVIDER: "yahoo" | "simulated" = "yahoo";

export const STARTING_CASH_RUPEES = 1000000; // virtual money for every new user
export const QUOTE_TTL_SECONDS = 900; // prices are saved for 15 minutes (they are delayed anyway)
export const MAX_QTY_PER_TRADE = 10000;

export type StockDef = {
  symbol: string; // the name used inside the app
  name: string;
  yahoo: string; // the name used by the price feed (NSE shares end with .NS)
  basePrice: number; // rough price in rupees, used ONLY for simulated prices
};

// The basePrice values are rough placeholders for the simulated fallback.
// They are NOT live prices. Update them occasionally if you rely on the fallback.
export const STOCKS: StockDef[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", yahoo: "RELIANCE.NS", basePrice: 1400 },
  { symbol: "TCS", name: "Tata Consultancy Services", yahoo: "TCS.NS", basePrice: 3200 },
  { symbol: "HDFCBANK", name: "HDFC Bank", yahoo: "HDFCBANK.NS", basePrice: 1000 },
  { symbol: "INFY", name: "Infosys", yahoo: "INFY.NS", basePrice: 1600 },
  { symbol: "ICICIBANK", name: "ICICI Bank", yahoo: "ICICIBANK.NS", basePrice: 1300 },
  { symbol: "ITC", name: "ITC", yahoo: "ITC.NS", basePrice: 420 },
  { symbol: "SBIN", name: "State Bank of India", yahoo: "SBIN.NS", basePrice: 800 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", yahoo: "BHARTIARTL.NS", basePrice: 1900 },
  { symbol: "LT", name: "Larsen and Toubro", yahoo: "LT.NS", basePrice: 3600 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", yahoo: "HINDUNILVR.NS", basePrice: 2400 },
];

export function findStock(symbol: string): StockDef | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}