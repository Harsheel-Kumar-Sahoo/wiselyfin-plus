import { Router } from "express";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { getNews } from "../services/news.js";
import { asyncHandler } from "../utils/errors.js";

export const newsRouter = Router();

newsRouter.use(requireAuth);

// Always answers with ok: true. A news problem is a friendly status, never a crash.
newsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    await connectDb();
    const news = await getNews();
    res.json({ ok: true, ...news });
  })
);