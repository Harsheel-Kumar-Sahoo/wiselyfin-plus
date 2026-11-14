import crypto from "node:crypto";
import { Router } from "express";
import { getEnv } from "../config/env.js";
import { connectDb } from "../db/connect.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const cronRouter = Router();

// Vercel sends "Authorization: Bearer <CRON_SECRET>" with every scheduled call.
function isAuthorized(header: string | undefined): boolean {
  const expected = Buffer.from(`Bearer ${getEnv().CRON_SECRET}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

// Writes one small record every day so the free database never counts as inactive.
cronRouter.get(
  "/keepalive",
  asyncHandler(async (req, res) => {
    if (!isAuthorized(req.headers.authorization)) {
      throw new AppError(401, "UNAUTHORIZED", "Not allowed.");
    }
    const conn = await connectDb();
    const db = conn.connection.db;
    if (!db) throw new Error("Database not ready");
    const lastRun = new Date();
    await db
      .collection<{ _id: string; lastRun: Date }>("heartbeat")
      .updateOne({ _id: "keepalive" }, { $set: { lastRun } }, { upsert: true });
    res.json({ ok: true, lastRun: lastRun.toISOString() });
  })
);