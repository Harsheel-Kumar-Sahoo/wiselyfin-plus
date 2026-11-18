import mongoose from "mongoose";
import { Router } from "express";
import { STOCKS, findStock } from "../config/market.js";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { Holding } from "../models/Holding.js";
import { Trade } from "../models/Trade.js";
import { getQuoteBook } from "../services/market.js";
import { ensurePortfolio, executeTrade } from "../services/trading.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { tradeSchema } from "../validation/trade.js";

export const stocksRouter = Router();

stocksRouter.use(requireAuth);

// All prices. Saved for 15 minutes, and never fails: simulated prices are the fallback.
stocksRouter.get(
  "/quotes",
  asyncHandler(async (_req, res) => {
    await connectDb();
    const book = await getQuoteBook();
    res.json({
      ok: true,
      asOf: book.asOf,
      quotes: STOCKS.map((s) => {
        const q = book.quotes[s.symbol];
        return {
          symbol: s.symbol,
          name: s.name,
          price: (q?.pricePaise ?? 0) / 100,
          source: q?.source ?? "simulated",
        };
      }),
    });
  })
);

// Cash, holdings with profit and loss, and totals.
stocksRouter.get(
  "/portfolio",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    await connectDb();
    const portfolio = await ensurePortfolio(userId);
    const holdings = await Holding.find({ userId, qty: { $gt: 0 } }).lean();
    const book = await getQuoteBook();

    let valuePaise = 0;
    let costPaise = 0;
    const rows = holdings.map((h) => {
      const quote = book.quotes[h.symbol];
      const price = quote?.pricePaise ?? 0;
      const value = price * h.qty;
      valuePaise += value;
      costPaise += h.costPaise;
      return {
        symbol: h.symbol,
        name: findStock(h.symbol)?.name ?? h.symbol,
        qty: h.qty,
        avgPrice: h.qty > 0 ? h.costPaise / h.qty / 100 : 0,
        price: price / 100,
        value: value / 100,
        pnl: (value - h.costPaise) / 100,
        pnlPercent: h.costPaise > 0 ? ((value - h.costPaise) / h.costPaise) * 100 : 0,
        source: quote?.source ?? "simulated",
      };
    });

    const realized = await Trade.aggregate<{ total: number }>([
      { $match: { userId: new mongoose.Types.ObjectId(userId), side: "sell" } },
      { $group: { _id: null, total: { $sum: "$realizedPaise" } } },
    ]);
    const realizedPaise = realized[0]?.total ?? 0;
    const netWorth = portfolio.cashPaise + valuePaise;

    res.json({
      ok: true,
      asOf: book.asOf,
      cash: portfolio.cashPaise / 100,
      holdingsValue: valuePaise / 100,
      netWorth: netWorth / 100,
      startingCash: portfolio.startingPaise / 100,
      totalPnl: (netWorth - portfolio.startingPaise) / 100,
      unrealizedPnl: (valuePaise - costPaise) / 100,
      realizedPnl: realizedPaise / 100,
      holdings: rows,
    });
  })
);

// Buy or sell. The server picks the price, checks cash and shares, and writes the ledger.
stocksRouter.post(
  "/trade",
  rateLimit("trade", 60, 600),
  asyncHandler(async (req, res) => {
    const body = tradeSchema.parse(req.body);
    const userId = req.auth!.sub;
    await connectDb();

    const book = await getQuoteBook();
    const quote = book.quotes[body.symbol];
    if (!quote) throw new AppError(503, "NO_PRICE", "No price is available right now. Please try again.");

    const done = await executeTrade({ userId, quote, side: body.side, qty: body.qty });
    res.json({
      ok: true,
      trade: {
        symbol: body.symbol,
        side: body.side,
        qty: body.qty,
        price: quote.pricePaise / 100,
        total: (quote.pricePaise * body.qty) / 100,
        realized: done.realizedPaise / 100,
        source: quote.source,
      },
      cash: done.cashPaise / 100,
    });
  })
);

// The latest 100 trades.
stocksRouter.get(
  "/trades",
  asyncHandler(async (req, res) => {
    await connectDb();
    const rows = await Trade.find({ userId: req.auth!.sub }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({
      ok: true,
      trades: rows.map((t) => ({
        id: String(t._id),
        symbol: t.symbol,
        side: t.side,
        qty: t.qty,
        price: t.pricePaise / 100,
        total: t.totalPaise / 100,
        realized: t.realizedPaise / 100,
        source: t.priceSource,
        createdAt: t.createdAt,
      })),
    });
  })
);