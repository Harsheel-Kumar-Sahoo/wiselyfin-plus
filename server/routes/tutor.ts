import { Router } from "express";
import { GEMINI_MODEL, QUESTIONS_PER_HOUR } from "../config/ai.js";
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

// Shows whether the server can see the AI settings. It never shows the key itself.
tutorRouter.get(
  "/check",
  rateLimit("tutorcheck", 10, 3600),
  asyncHandler(async (_req, res) => {
    const key = process.env.AI_API_KEY ?? "";
    const provider = process.env.AI_PROVIDER ?? "(not set)";
    let google = "not tested";
    if (key) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Say OK" }] }] }),
            signal: AbortSignal.timeout(15000),
          }
        );
        google = `HTTP ${r.status}`;
        if (!r.ok) {
          const body = (await r.json().catch(() => null)) as { error?: { message?: string } } | null;
          google += `: ${(body?.error?.message ?? "").slice(0, 200).replace(key, "[key]")}`;
        }
      } catch {
        google = "could not reach Google";
      }
    }
    res.json({ ok: true, provider, keyPresent: key.length > 0, keyLength: key.length, model: GEMINI_MODEL, google });
  })
);

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
      res.json({ ok: true, status: result.reason });
      return;
    }
    res.json({ ok: true, status: "answer", answer: result.text });
  })
);