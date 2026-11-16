import { z } from "zod";

// No angle brackets in free text, so nothing can ever look like HTML.
const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .regex(/^[^<>]*$/, "The characters < and > are not allowed.");

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CATEGORIES = [
  "food",
  "transport",
  "rent",
  "bills",
  "shopping",
  "health",
  "education",
  "entertainment",
  "savings",
  "salary",
  "other",
] as const;

export const expenseSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive().max(100000000), // rupees
  category: z.enum(CATEGORIES),
  note: safeText(120).default(""),
  day,
});

export const goalSchema = z.object({
  name: safeText(60).min(1),
  target: z.number().positive().max(1000000000),
  targetDay: day.or(z.literal("")).default(""),
});

export const goalAddSchema = z.object({
  amount: z.number().positive().max(1000000000),
});

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
});