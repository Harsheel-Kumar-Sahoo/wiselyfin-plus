// Easy-to-edit settings for streaks, levels, badges and the daily challenge.
// Change a number here and redeploy.

// Level n starts at 50 * n * (n - 1) XP: level 2 at 100, level 3 at 300, level 4 at 600.
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

// Coins paid when a streak reaches this many days.
export const STREAK_REWARDS: Record<number, number> = {
  3: 5,
  7: 15,
  14: 30,
  30: 75,
};

export const DAILY_CHALLENGE_COINS = 15;
export const DAILY_CHALLENGE_XP = 30;

export type BadgeMetric = "lessonsPassed" | "streak" | "pathsCompleted" | "coins" | "level" | "challenges";

export type BadgeDef = {
  id: string; // never change an id after launch: it is saved for users
  icon: string; // a Lucide icon name, matched in the app
  metric: BadgeMetric;
  threshold: number;
};

export const BADGES: BadgeDef[] = [
  { id: "first_lesson", icon: "BookOpen", metric: "lessonsPassed", threshold: 1 },
  { id: "lessons_5", icon: "GraduationCap", metric: "lessonsPassed", threshold: 5 },
  { id: "lessons_10", icon: "Award", metric: "lessonsPassed", threshold: 10 },
  { id: "streak_3", icon: "Flame", metric: "streak", threshold: 3 },
  { id: "streak_7", icon: "Flame", metric: "streak", threshold: 7 },
  { id: "streak_30", icon: "Flame", metric: "streak", threshold: 30 },
  { id: "first_path", icon: "Trophy", metric: "pathsCompleted", threshold: 1 },
  { id: "coins_100", icon: "Coins", metric: "coins", threshold: 100 },
  { id: "level_3", icon: "Star", metric: "level", threshold: 3 },
  { id: "level_5", icon: "Star", metric: "level", threshold: 5 },
  { id: "challenge_5", icon: "Target", metric: "challenges", threshold: 5 },
];