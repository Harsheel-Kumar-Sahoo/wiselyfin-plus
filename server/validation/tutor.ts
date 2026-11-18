import { z } from "zod";
import { MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS } from "../config/ai.js";

// The browser sends the new question and a few earlier messages for context.
export const tutorSchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_CHARS),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(2000),
      })
    )
    .max(MAX_HISTORY_MESSAGES)
    .default([]),
});