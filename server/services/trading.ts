import mongoose from "mongoose";
import { STARTING_CASH_RUPEES } from "../config/market.js";
import { Holding } from "../models/Holding.js";
import { Portfolio } from "../models/Portfolio.js";
import { Trade } from "../models/Trade.js";
import { AppError } from "../utils/errors.js";
import type { Quote } from "./market.js";

// Creates the virtual account the first time it is needed.
export async function ensurePortfolio(userId: string) {
  const start = STARTING_CASH_RUPEES * 100;
  try {
    await Portfolio.updateOne(
      { userId },
      { $setOnInsert: { userId, cashPaise: start, startingPaise: start } },
      { upsert: true }
    );
  } catch (err) {
    // Two requests at the same moment: the other one created it.
    if ((err as { code?: number }).code !== 11000) throw err;
  }
  const portfolio = await Portfolio.findOne({ userId }).lean();
  if (!portfolio) throw new Error("Portfolio could not be created.");
  return portfolio;
}

type TradeInput = { userId: string; quote: Quote; side: "buy" | "sell"; qty: number };
export type TradeOutcome = { cashPaise: number; realizedPaise: number };

// Buys or sells in one all-or-nothing step, and writes the trade ledger row.
export async function executeTrade(input: TradeInput): Promise<TradeOutcome> {
  const { userId, quote, side, qty } = input;
  const price = quote.pricePaise;
  const total = price * qty;

  await ensurePortfolio(userId);
  const session = await mongoose.startSession();

  try {
    const outcome = await session.withTransaction(async (): Promise<TradeOutcome> => {
      if (side === "buy") {
        // The filter makes sure the cash is enough at the moment of the update.
        const updated = await Portfolio.findOneAndUpdate(
          { userId, cashPaise: { $gte: total } },
          { $inc: { cashPaise: -total } },
          { returnDocument: "after", session }
        );
        if (!updated) throw new AppError(400, "NOT_ENOUGH_CASH", "Not enough virtual cash for this trade.");

        await Holding.updateOne(
          { userId, symbol: quote.symbol },
          { $inc: { qty, costPaise: total } },
          { upsert: true, session }
        );
        await Trade.create(
          [
            {
              userId,
              symbol: quote.symbol,
              side,
              qty,
              pricePaise: price,
              totalPaise: total,
              realizedPaise: 0,
              cashAfterPaise: updated.cashPaise,
              priceSource: quote.source,
            },
          ],
          { session }
        );
        return { cashPaise: updated.cashPaise, realizedPaise: 0 };
      }

      const holding = await Holding.findOne({ userId, symbol: quote.symbol }).session(session);
      if (!holding || holding.qty < qty) {
        throw new AppError(400, "NOT_ENOUGH_SHARES", "You do not own that many shares.");
      }
      // Cost removed is the average cost of the shares sold.
      const costRemoved = Math.round((holding.costPaise * qty) / holding.qty);
      const realized = total - costRemoved;

      const ok = await Holding.findOneAndUpdate(
        { _id: holding._id, qty: { $gte: qty } },
        { $inc: { qty: -qty, costPaise: -costRemoved } },
        { returnDocument: "after", session }
      );
      if (!ok) throw new AppError(400, "NOT_ENOUGH_SHARES", "You do not own that many shares.");
      if (ok.qty === 0) await Holding.deleteOne({ _id: ok._id }, { session });

      const updated = await Portfolio.findOneAndUpdate(
        { userId },
        { $inc: { cashPaise: total } },
        { returnDocument: "after", session }
      );
      if (!updated) throw new Error("Portfolio missing.");

      await Trade.create(
        [
          {
            userId,
            symbol: quote.symbol,
            side,
            qty,
            pricePaise: price,
            totalPaise: total,
            realizedPaise: realized,
            cashAfterPaise: updated.cashPaise,
            priceSource: quote.source,
          },
        ],
        { session }
      );
      return { cashPaise: updated.cashPaise, realizedPaise: realized };
    });

    if (!outcome) throw new Error("Trade failed.");
    return outcome;
  } finally {
    await session.endSession();
  }
}