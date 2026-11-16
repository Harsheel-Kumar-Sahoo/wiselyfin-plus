import { Router } from "express";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { Lesson } from "../models/Lesson.js";
import { Path } from "../models/Path.js";
import { Progress } from "../models/Progress.js";
import { awardBadges } from "../services/badges.js";
import { creditCoins } from "../services/ledger.js";
import { gradeQuiz } from "../services/quiz.js";
import { touchStreak } from "../services/streak.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { parseLang, pick } from "../utils/localize.js";
import { slugParamSchema, submitQuizSchema } from "../validation/learn.js";

export const learnRouter = Router();

learnRouter.use(requireAuth);

// All learning paths, with the user's progress in each.
learnRouter.get(
  "/paths",
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const userId = req.auth!.sub;
    await connectDb();

    const [paths, lessons, passed] = await Promise.all([
      Path.find({ published: true }).sort({ order: 1 }).lean(),
      Lesson.find({ published: true }).select("_id pathId").lean(),
      Progress.find({ userId, passed: true }).select("lessonId").lean(),
    ]);
    const passedIds = new Set(passed.map((p) => String(p.lessonId)));

    const items = paths.map((p) => {
      const mine = lessons.filter((l) => String(l.pathId) === String(p._id));
      return {
        slug: p.slug,
        title: pick(p.title, lang),
        description: pick(p.description, lang),
        icon: p.icon,
        completionCoins: p.completionCoins,
        totalLessons: mine.length,
        completedLessons: mine.filter((l) => passedIds.has(String(l._id))).length,
      };
    });
    res.json({ ok: true, paths: items });
  })
);

// One path with its lessons.
learnRouter.get(
  "/paths/:slug",
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const { slug } = slugParamSchema.parse(req.params);
    const userId = req.auth!.sub;
    await connectDb();

    const path = await Path.findOne({ slug, published: true }).lean();
    if (!path) throw new AppError(404, "NOT_FOUND", "This learning path was not found.");

    const lessons = await Lesson.find({ pathId: path._id, published: true })
      .sort({ order: 1 })
      .select("slug title rewardCoins rewardXp")
      .lean();
    const progress = await Progress.find({ userId, pathId: path._id }).lean();
    const byLesson = new Map(progress.map((p) => [String(p.lessonId), p]));

    res.json({
      ok: true,
      path: {
        slug: path.slug,
        title: pick(path.title, lang),
        description: pick(path.description, lang),
        completionCoins: path.completionCoins,
      },
      lessons: lessons.map((l) => {
        const mine = byLesson.get(String(l._id));
        return {
          slug: l.slug,
          title: pick(l.title, lang),
          rewardCoins: l.rewardCoins,
          rewardXp: l.rewardXp,
          passed: mine?.passed ?? false,
          bestScore: mine?.bestScore ?? 0,
        };
      }),
    });
  })
);

// One lesson. The correct answers are NOT included.
learnRouter.get(
  "/lessons/:slug",
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const { slug } = slugParamSchema.parse(req.params);
    const userId = req.auth!.sub;
    await connectDb();

    const lesson = await Lesson.findOne({ slug, published: true }).lean();
    if (!lesson) throw new AppError(404, "NOT_FOUND", "This lesson was not found.");

    const [path, next, progress] = await Promise.all([
      Path.findById(lesson.pathId).select("slug title").lean(),
      Lesson.findOne({ pathId: lesson.pathId, published: true, order: { $gt: lesson.order } })
        .sort({ order: 1 })
        .select("slug")
        .lean(),
      Progress.findOne({ userId, lessonId: lesson._id }).lean(),
    ]);

    res.json({
      ok: true,
      lesson: {
        slug: lesson.slug,
        title: pick(lesson.title, lang),
        body: pick(lesson.body, lang),
        rewardCoins: lesson.rewardCoins,
        rewardXp: lesson.rewardXp,
        passed: progress?.passed ?? false,
        bestScore: progress?.bestScore ?? 0,
        nextSlug: next?.slug ?? null,
        pathSlug: path?.slug ?? null,
        pathTitle: path ? pick(path.title, lang) : "",
        questions: lesson.questions.map((q) => ({
          id: String(q._id),
          prompt: pick(q.prompt, lang),
          options: q.options.map((o) => pick(o, lang)),
        })),
      },
    });
  })
);

// The browser sends only the chosen option numbers. The server decides everything else.
learnRouter.post(
  "/lessons/:slug/submit",
  rateLimit("quiz", 30, 600),
  asyncHandler(async (req, res) => {
    const lang = parseLang(req.query.lang);
    const { slug } = slugParamSchema.parse(req.params);
    const body = submitQuizSchema.parse(req.body);
    const userId = req.auth!.sub;
    await connectDb();

    const lesson = await Lesson.findOne({ slug, published: true }).lean();
    if (!lesson) throw new AppError(404, "NOT_FOUND", "This lesson was not found.");

    const grade = gradeQuiz(lesson.questions, body.answers);
    if (!grade) throw new AppError(400, "INVALID_INPUT", "Please answer every question.");

    const progress = await Progress.findOneAndUpdate(
      { userId, lessonId: lesson._id },
      {
        $inc: { attempts: 1 },
        $max: { bestScore: grade.percent },
        $setOnInsert: { pathId: lesson.pathId },
      },
      { upsert: true, returnDocument: "after" }
    );
    if (grade.passed && progress && !progress.passed) {
      await Progress.updateOne({ _id: progress._id, passed: false }, { passed: true, completedAt: new Date() });
    }

    let balance: number | undefined;
    let coinsEarned = 0;
    let xpEarned = 0;
    let pathCompleted = false;
    let pathBonus = 0;
    let streakValue = 0;
    let streakCoins = 0;
    let newBadges: string[] = [];

    if (grade.passed) {
      // The same lesson can only ever pay once, because the reference key is unique.
      if (lesson.rewardCoins > 0) {
        const paid = await creditCoins({
          userId,
          amount: lesson.rewardCoins,
          xp: lesson.rewardXp,
          reason: "lesson_reward",
          refKey: `lesson:${lesson._id}`,
        });
        balance = paid.balance;
        if (paid.credited) {
          coinsEarned = lesson.rewardCoins;
          xpEarned = lesson.rewardXp;
        }
      }

      const ids = await Lesson.find({ pathId: lesson.pathId, published: true }).select("_id").lean();
      const passedCount = await Progress.countDocuments({
        userId,
        passed: true,
        lessonId: { $in: ids.map((l) => l._id) },
      });
      if (ids.length > 0 && passedCount >= ids.length) {
        pathCompleted = true;
        const path = await Path.findById(lesson.pathId).select("completionCoins").lean();
        if (path && path.completionCoins > 0) {
          const paid = await creditCoins({
            userId,
            amount: path.completionCoins,
            reason: "path_completion",
            refKey: `path:${lesson.pathId}`,
          });
          balance = paid.balance;
          if (paid.credited) pathBonus = path.completionCoins;
        }
      }

      // Streak and badges are a bonus. If they fail, the quiz result is still returned.
      try {
        const streak = await touchStreak(userId);
        streakValue = streak.streak;
        streakCoins = streak.rewardCoins;
        newBadges = await awardBadges(userId);
      } catch (err) {
        console.error("Streak or badge update failed:", err instanceof Error ? err.message : "unknown");
      }
    }

    res.json({
      ok: true,
      result: {
        correct: grade.correct,
        total: grade.total,
        percent: grade.percent,
        passed: grade.passed,
        questions: lesson.questions.map((q, i) => ({
          id: String(q._id),
          correct: grade.results[i]?.correct ?? false,
          correctIndex: grade.results[i]?.correctIndex ?? 0,
          explanation: pick(q.explanation, lang),
        })),
      },
      reward: { coins: coinsEarned, xp: xpEarned, pathCompleted, pathBonus },
      streak: { value: streakValue, rewardCoins: streakCoins },
      newBadges,
      balance,
    });
  })
);