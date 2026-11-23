import cookieParser from "cookie-parser";
import express from "express";
import { connectDb } from "./db/connect.js";
import { accountRouter } from "./routes/account.js";
import { authRouter } from "./routes/auth.js";
import { budgetRouter } from "./routes/budget.js";
import { communityRouter } from "./routes/community.js";
import { cronRouter } from "./routes/cron.js";
import { engagementRouter } from "./routes/engagement.js";
import { learnRouter } from "./routes/learn.js";
import { newsRouter } from "./routes/news.js";
import { stocksRouter } from "./routes/stocks.js";
import { tutorRouter } from "./routes/tutor.js";
import { walletRouter } from "./routes/wallet.js";
import { errorHandler, notFound } from "./utils/errors.js";

export const app = express();

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// Health check: the app can answer even when the database cannot.
app.get("/api/health", async (_req, res) => {
  let database = "connected";
  try {
    const conn = await connectDb();
    await conn.connection.db?.command({ ping: 1 });
  } catch {
    database = "unreachable";
  }
  res.status(database === "connected" ? 200 : 503).json({
    ok: database === "connected",
    database,
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/auth", accountRouter);
app.use("/api/cron", cronRouter);
app.use("/api/learn", learnRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/engagement", engagementRouter);
app.use("/api/community", communityRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/news", newsRouter);

app.use(notFound);
app.use(errorHandler);