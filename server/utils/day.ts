// Days are counted in India time (UTC+05:30), so a new day starts at midnight in India.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns a day as text like "2026-11-16". Use offsetDays = -1 for yesterday.
export function istDay(offsetDays = 0): string {
  return new Date(Date.now() + IST_OFFSET_MS + offsetDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}