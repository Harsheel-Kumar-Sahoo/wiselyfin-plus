import { Cache } from "../models/Cache.js";

// Returns the saved answer if it is still fresh. Otherwise it runs `build`, saves the result and returns it.
// If the cache itself fails, the answer is still built, so the app keeps working.
export async function cached<T>(key: string, ttlSeconds: number, build: () => Promise<T>): Promise<T> {
  try {
    const hit = await Cache.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
    if (hit) return hit.value as T;
  } catch {
    // Ignore and build fresh.
  }

  const value = await build();

  try {
    await Cache.updateOne(
      { key },
      { $set: { value, expiresAt: new Date(Date.now() + ttlSeconds * 1000) } },
      { upsert: true }
    );
  } catch {
    // Ignore: not saving the cache is not an error.
  }
  return value;
}