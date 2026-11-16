import { STREAK_REWARDS } from "../config/gamification.js";
import { User } from "../models/User.js";
import { istDay } from "../utils/day.js";
import { creditCoins } from "./ledger.js";

export type StreakResult = { streak: number; changed: boolean; rewardCoins: number };

// Call this when the user does something meaningful (for example passes a quiz).
// It counts at most once per day, and the server alone decides the streak.
export async function touchStreak(userId: string): Promise<StreakResult> {
  const today = istDay();
  const yesterday = istDay(-1);

  const user = await User.findById(userId).select("streak lastActiveDay").lean();
  if (!user) return { streak: 0, changed: false, rewardCoins: 0 };
  if (user.lastActiveDay === today) return { streak: user.streak, changed: false, rewardCoins: 0 };

  const next = user.lastActiveDay === yesterday ? user.streak + 1 : 1;

  // The filter makes sure two requests at the same moment cannot both count.
  const updated = await User.findOneAndUpdate(
    { _id: userId, lastActiveDay: { $ne: today } },
    { $set: { streak: next, lastActiveDay: today } },
    { returnDocument: "after" }
  );
  if (!updated) return { streak: user.streak, changed: false, rewardCoins: 0 };

  let rewardCoins = 0;
  const reward = STREAK_REWARDS[next];
  if (reward) {
    const paid = await creditCoins({
      userId,
      amount: reward,
      reason: "streak_reward",
      refKey: `streak:${next}:${today}`,
    });
    if (paid.credited) rewardCoins = reward;
  }
  return { streak: next, changed: true, rewardCoins };
}