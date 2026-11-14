import type { NextFunction, Request, Response } from "express";
import { connectDb } from "../db/connect.js";
import { RateLimit } from "../models/RateLimit.js";
import { AppError } from "../utils/errors.js";

export function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (first ?? req.socket.remoteAddress ?? "unknown").trim();
}

// Example: rateLimit("login", 10, 900) allows 10 tries per 15 minutes for each visitor address.
export function rateLimit(name: string, max: number, windowSeconds: number) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let count = 0;
    try {
      await connectDb();
      const key = `${name}:${clientIp(req)}`;
      const now = new Date();
      await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
      const row = await RateLimit.findOneAndUpdate(
        { key },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) },
        },
        { upsert: true, new: true }
      );
      count = row?.count ?? 1;
    } catch {
      // If the counter itself fails, let the request continue so the app keeps working.
      return next();
    }
    if (count > max) {
      return next(
        new AppError(429, "RATE_LIMITED", "Too many attempts. Please wait a few minutes and try again.")
      );
    }
    return next();
  };
}