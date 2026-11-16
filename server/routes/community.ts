import { Router } from "express";
import { BADGES, levelForXp, xpForLevel } from "../config/gamification.js";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { Progress } from "../models/Progress.js";
import { User } from "../models/User.js";
import { UserBadge } from "../models/UserBadge.js";
import { cached } from "../services/cache.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const communityRouter = Router();

communityRouter.use(requireAuth);

// Top 20 by XP. The list is saved for 5 minutes so many visitors cost one database read.
communityRouter.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    await connectDb();

    const top = await cached("leaderboard:top20", 300, async () => {
      const users = await User.find({ xp: { $gt: 0 } })
        .sort({ xp: -1, createdAt: 1 })
        .limit(20)
        .select("name xp")
        .lean();
      return users.map((u, i) => ({
        id: String(u._id),
        rank: i + 1,
        name: u.name,
        xp: u.xp,
        level: levelForXp(u.xp),
      }));
    });

    // The user's own rank is always fresh and cheap to count.
    const me = await User.findById(userId).select("name xp").lean();
    if (!me) throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    const ahead = me.xp > 0 ? await User.countDocuments({ xp: { $gt: me.xp } }) : null;

    res.json({
      ok: true,
      top: top.map((e) => ({ ...e, isMe: e.id === userId })),
      me: { xp: me.xp, level: levelForXp(me.xp), rank: ahead === null ? null : ahead + 1 },
    });
  })
);

// Everything the profile screen needs in one call.
communityRouter.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    await connectDb();

    const [user, owned, lessonsPassed] = await Promise.all([
      User.findById(userId).lean(),
      UserBadge.find({ userId }).lean(),
      Progress.countDocuments({ userId, passed: true }),
    ]);
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Please log in again.");

    const level = levelForXp(user.xp);
    const earned = new Map(owned.map((b) => [b.badgeId, b.createdAt]));

    res.json({
      ok: true,
      profile: {
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
        xp: user.xp,
        level,
        levelStartXp: xpForLevel(level),
        nextLevelXp: xpForLevel(level + 1),
        streak: user.streak,
        finCoins: user.finCoins,
        lessonsPassed,
      },
      badges: BADGES.map((b) => ({
        id: b.id,
        icon: b.icon,
        earned: earned.has(b.id),
        earnedAt: earned.get(b.id) ?? null,
      })),
    });
  })
);