import { Router } from "express";
import { QUESTIONS_PER_HOUR } from "../config/ai.js";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { askTutor } from "../services/ai.js";
import { asyncHandler } from "../utils/errors.js";
import { parseLang } from "../utils/localize.js";
import { tutorSchema } from "../validation/tutor.js";

export const tutorRouter = Router();

tutorRouter.use(requireAuth);

// Words that suggest the user typed a secret. We refuse before sending anything to the AI.
const SECRET_PATTERN = /\b(otp|pin|cvv|password|passcode)\b\s*(is|:|=)?\s*\d{3,}/i;
const CARD_PATTERN = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/;

tutorRouter.post(
  "/ask",
  rateLimit("tutor", QUESTIONS_PER_HOUR, 3600),
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const body = tutorSchema.parse(req.body);
    await connectDb();

    if (SECRET_PATTERN.test(body.question) || CARD_PATTERN.test(body.question)) {
      res.json({ ok: true, status: "secret_warning" });
      return;
    }

    const messages = [...body.history, { role: "user" as const, text: body.question }];
    const result = await askTutor(messages, lang);

    if (!result.ok) {
      // The tutor is a bonus feature: a failure is a normal, friendly answer, not a crash.
      res.json({ ok: true, status: result.reason });
      return;
    }
    res.json({ ok: true, status: "answer", answer: result.text });
  })
);