import { z } from "zod";

// The browser sends only the chosen option numbers. It never sends scores or rewards.
export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0).max(9)).min(1).max(30),
});

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{1,80}$/),
});