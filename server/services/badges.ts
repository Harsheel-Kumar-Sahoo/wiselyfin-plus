import { BADGES, levelForXp } from "../config/gamification.js";
import { ChallengeAttempt } from "../models/ChallengeAttempt.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { Progress } from "../models/Progress.js";
import { User } from "../models/User.js";
import { UserBadge } from "../models/UserBadge.js";

// Checks every badge rule and saves the newly earned ones. Returns the new badge ids.
export async function awardBadges(userId: string): Promise<string[]> {
  const [user, lessonsPassed, pathsCompleted, challenges, owned] = await Promise.all([
    User.findById(userId).select("streak finCoins xp").lean(),
    Progress.countDocuments({ userId, passed: true }),
    LedgerEntry.countDocuments({ userId, reason: "path_completion" }),
    ChallengeAttempt.countDocuments({ userId, correct: true }),
    UserBadge.find({ userId }).select("badgeId").lean(),
  ]);
  if (!user) return [];

  const stats = {
    lessonsPassed,
    streak: user.streak,
    pathsCompleted,
    coins: user.finCoins,
    level: levelForXp(user.xp),
    challenges,
  };

  const have = new Set(owned.map((b) => b.badgeId));
  const added: string[] = [];

  for (const badge of BADGES) {
    if (have.has(badge.id) || stats[badge.metric] < badge.threshold) continue;
    try {
      await UserBadge.create({ userId, badgeId: badge.id });
      added.push(badge.id);
    } catch (err) {
      // Already saved by a request at the same moment: ignore.
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  return added;
}