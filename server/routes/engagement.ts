import { Router } from "express";
import { DAILY_CHALLENGE_COINS, DAILY_CHALLENGE_XP } from "../config/gamification.js";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { ChallengeAttempt } from "../models/ChallengeAttempt.js";
import { awardBadges } from "../services/badges.js";
import { getDailyQuestion } from "../services/challenge.js";
import { creditCoins } from "../services/ledger.js";
import { touchStreak } from "../services/streak.js";
import { istDay } from "../utils/day.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { parseLang, pick } from "../utils/localize.js";
import { challengeAnswerSchema } from "../validation/engagement.js";

export const engagementRouter = Router();

engagementRouter.use(requireAuth);

// Today's challenge question. The correct answer is NOT included.
engagementRouter.get(
  "/challenge",
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const userId = req.auth!.sub;
    const day = istDay();
    await connectDb();

    const question = await getDailyQuestion(day);
    if (!question) {
      res.json({ ok: true, available: false });
      return;
    }
    const attempt = await ChallengeAttempt.findOne({ userId, day }).lean();

    res.json({
      ok: true,
      available: true,
      day,
      rewardCoins: DAILY_CHALLENGE_COINS,
      rewardXp: DAILY_CHALLENGE_XP,
      attempted: Boolean(attempt),
      wasCorrect: attempt?.correct ?? false,
      question: {
        prompt: pick(question.prompt, lang),
        options: question.options.map((o) => pick(o, lang)),
      },
    });
  })
);

// One try per day. The server checks the answer and decides the reward.
engagementRouter.post(
  "/challenge/answer",
  rateLimit("challenge", 20, 600),
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const body = challengeAnswerSchema.parse(req.body);
    const userId = req.auth!.sub;
    const day = istDay();
    await connectDb();

    const question = await getDailyQuestion(day);
    if (!question) throw new AppError(404, "NOT_FOUND", "There is no challenge today.");
    if (body.choice >= question.options.length) {
      throw new AppError(400, "INVALID_INPUT", "Please choose one of the answers.");
    }

    const correct = body.choice === question.correctIndex;

    try {
      await ChallengeAttempt.create({ userId, day, correct });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new AppError(409, "ALREADY_DONE", "You already tried today's challenge.");
      }
      throw err;
    }

    let coins = 0;
    let xp = 0;
    if (correct) {
      const paid = await creditCoins({
        userId,
        amount: DAILY_CHALLENGE_COINS,
        xp: DAILY_CHALLENGE_XP,
        reason: "challenge_reward",
        refKey: `challenge:${day}`,
      });
      if (paid.credited) {
        coins = DAILY_CHALLENGE_COINS;
        xp = DAILY_CHALLENGE_XP;
      }
    }

    const streak = await touchStreak(userId);
    const newBadges = await awardBadges(userId);

    res.json({
      ok: true,
      correct,
      correctIndex: question.correctIndex,
      explanation: pick(question.explanation, lang),
      reward: { coins, xp },
      streak: { value: streak.streak, rewardCoins: streak.rewardCoins },
      newBadges,
    });
  })
);