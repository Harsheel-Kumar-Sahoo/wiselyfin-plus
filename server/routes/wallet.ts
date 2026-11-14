import { Router } from "express";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const walletRouter = Router();

walletRouter.use(requireAuth);

// Balance plus the latest 50 coin changes.
walletRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    await connectDb();

    const [user, entries] = await Promise.all([
      User.findById(userId).select("finCoins xp").lean(),
      LedgerEntry.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Please log in again.");

    res.json({
      ok: true,
      balance: user.finCoins,
      xp: user.xp,
      entries: entries.map((e) => ({
        id: String(e._id),
        amount: e.amount,
        balanceAfter: e.balanceAfter,
        reason: e.reason,
        createdAt: e.createdAt,
      })),
    });
  })
);