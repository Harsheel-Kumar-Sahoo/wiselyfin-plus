import { Router } from "express";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { Expense } from "../models/Expense.js";
import { Goal } from "../models/Goal.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import {
  expenseSchema,
  goalAddSchema,
  goalSchema,
  idParamSchema,
  monthQuerySchema,
} from "../validation/budget.js";

export const budgetRouter = Router();

budgetRouter.use(requireAuth);

const toPaise = (rupees: number) => Math.round(rupees * 100);

// All entries of one month, plus totals per category.
budgetRouter.get(
  "/entries",
  asyncHandler(async (req, res) => {
    const { month } = monthQuerySchema.parse(req.query);
    const userId = req.auth!.sub;
    await connectDb();

    const rows = await Expense.find({
      userId,
      day: { $gte: `${month}-01`, $lte: `${month}-31` },
    })
      .sort({ day: -1, createdAt: -1 })
      .limit(500)
      .lean();

    let income = 0;
    let spent = 0;
    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      if (r.type === "income") income += r.amountPaise;
      else {
        spent += r.amountPaise;
        byCategory[r.category] = (byCategory[r.category] ?? 0) + r.amountPaise;
      }
    }

    res.json({
      ok: true,
      month,
      totals: { income: income / 100, spent: spent / 100, balance: (income - spent) / 100 },
      byCategory: Object.entries(byCategory).map(([category, paise]) => ({ category, amount: paise / 100 })),
      entries: rows.map((r) => ({
        id: String(r._id),
        type: r.type,
        amount: r.amountPaise / 100,
        category: r.category,
        note: r.note,
        day: r.day,
      })),
    });
  })
);

budgetRouter.post(
  "/entries",
  rateLimit("budget", 120, 600),
  asyncHandler(async (req, res) => {
    const body = expenseSchema.parse(req.body);
    const userId = req.auth!.sub;
    await connectDb();

    const count = await Expense.countDocuments({ userId });
    if (count >= 5000) throw new AppError(400, "LIMIT_REACHED", "You have reached the entry limit.");

    const row = await Expense.create({
      userId,
      type: body.type,
      amountPaise: toPaise(body.amount),
      category: body.category,
      note: body.note,
      day: body.day,
    });
    res.status(201).json({ ok: true, id: String(row._id) });
  })
);

budgetRouter.delete(
  "/entries/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await connectDb();
    await Expense.deleteOne({ _id: id, userId: req.auth!.sub });
    res.json({ ok: true });
  })
);

budgetRouter.get(
  "/goals",
  asyncHandler(async (req, res) => {
    await connectDb();
    const goals = await Goal.find({ userId: req.auth!.sub }).sort({ createdAt: -1 }).lean();
    res.json({
      ok: true,
      goals: goals.map((g) => ({
        id: String(g._id),
        name: g.name,
        target: g.targetPaise / 100,
        saved: g.savedPaise / 100,
        targetDay: g.targetDay,
      })),
    });
  })
);

budgetRouter.post(
  "/goals",
  rateLimit("goals", 60, 600),
  asyncHandler(async (req, res) => {
    const body = goalSchema.parse(req.body);
    const userId = req.auth!.sub;
    await connectDb();

    const count = await Goal.countDocuments({ userId });
    if (count >= 20) throw new AppError(400, "LIMIT_REACHED", "You have reached the goal limit.");

    const goal = await Goal.create({
      userId,
      name: body.name,
      targetPaise: toPaise(body.target),
      targetDay: body.targetDay,
    });
    res.status(201).json({ ok: true, id: String(goal._id) });
  })
);

// Adds money to a goal. Savings goals are a personal tracker and never give coins.
budgetRouter.post(
  "/goals/:id/add",
  rateLimit("goals", 60, 600),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = goalAddSchema.parse(req.body);
    await connectDb();

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.auth!.sub },
      { $inc: { savedPaise: toPaise(body.amount) } },
      { returnDocument: "after" }
    );
    if (!goal) throw new AppError(404, "NOT_FOUND", "This goal was not found.");
    res.json({ ok: true });
  })
);

budgetRouter.delete(
  "/goals/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await connectDb();
    await Goal.deleteOne({ _id: id, userId: req.auth!.sub });
    res.json({ ok: true });
  })
);