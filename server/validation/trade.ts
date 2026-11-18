import { z } from "zod";
import { MAX_QTY_PER_TRADE, STOCKS } from "../config/market.js";

const symbols = STOCKS.map((s) => s.symbol) as [string, ...string[]];

// The browser sends only these three things. The server decides the price.
export const tradeSchema = z.object({
  symbol: z.enum(symbols),
  side: z.enum(["buy", "sell"]),
  qty: z.number().int().min(1).max(MAX_QTY_PER_TRADE),
});