import { z } from "zod";

export const challengeAnswerSchema = z.object({
  choice: z.number().int().min(0).max(9),
});