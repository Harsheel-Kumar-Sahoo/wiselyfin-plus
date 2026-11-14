import mongoose from "mongoose";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { User } from "../models/User.js";

type CreditInput = {
  userId: string;
  amount: number; // whole number above zero
  xp?: number; // optional XP given together with the coins
  reason: string; // for example "lesson_reward"
  refKey: string; // for example "lesson:<id>"; the same key can only pay once
};

export type CreditResult = { credited: boolean; balance: number };

async function currentBalance(userId: string): Promise<number> {
  const user = await User.findById(userId).select("finCoins").lean();
  return user?.finCoins ?? 0;
}

// Adds coins and writes the ledger row in one all-or-nothing step.
// If the same refKey was already paid, nothing is added and credited is false.
export async function creditCoins(input: CreditInput): Promise<CreditResult> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error("Coin amount must be a whole number above zero.");
  }

  const session = await mongoose.startSession();
  let result: CreditResult = { credited: false, balance: 0 };

  try {
    await session.withTransaction(async () => {
      const existing = await LedgerEntry.findOne({ userId: input.userId, refKey: input.refKey })
        .session(session)
        .lean();
      if (existing) {
        result = { credited: false, balance: await currentBalance(input.userId) };
        return;
      }

      const user = await User.findByIdAndUpdate(
        input.userId,
        { $inc: { finCoins: input.amount, xp: input.xp ?? 0 } },
        { new: true, session }
      );
      if (!user) throw new Error("User not found.");

      await LedgerEntry.create(
        [
          {
            userId: input.userId,
            amount: input.amount,
            balanceAfter: user.finCoins,
            reason: input.reason,
            refKey: input.refKey,
          },
        ],
        { session }
      );
      result = { credited: true, balance: user.finCoins };
    });
  } catch (err) {
    // Two requests with the same refKey at the same moment: the second one is refused here.
    if ((err as { code?: number }).code === 11000) {
      return { credited: false, balance: await currentBalance(input.userId) };
    }
    throw err;
  } finally {
    await session.endSession();
  }

  return result;
}