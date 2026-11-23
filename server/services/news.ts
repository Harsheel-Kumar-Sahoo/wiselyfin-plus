import {
  NEWS_FRESH_SECONDS,
  NEWS_KEEP_SECONDS,
  NEWS_MAX_ARTICLES,
  NEWS_RETRY_SECONDS,
} from "../config/news.js";
import { Cache } from "../models/Cache.js";

export type Article = {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
};

export type NewsResult = {
  articles: Article[];
  status: "fresh" | "older" | "unavailable";
  savedAt: string | null;
};

type Saved = { articles: Article[]; savedAt: string };

function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/[<>]/g, "").trim().slice(0, max) : "";
}

// Asks GNews for business headlines from India. Returns null on any problem.
async function fetchHeadlines(): Promise<Article[] | null> {
  const key = process.env.NEWS_API_KEY;
  if (!key) return null;
  try {
    const url =
      "https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=in" +
      `&max=${NEWS_MAX_ARTICLES}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { articles?: unknown };
    if (!Array.isArray(json.articles)) return null;

    const articles: Article[] = [];
    for (const raw of json.articles) {
      const a = raw as Record<string, any>;
      const link = safeUrl(a?.url);
      const title = text(a?.title, 200);
      if (!link || !title) continue;
      articles.push({
        title,
        description: text(a?.description, 300),
        url: link,
        image: safeUrl(a?.image).startsWith("https:") ? safeUrl(a?.image) : "",
        source: text(a?.source?.name, 60),
        publishedAt: typeof a?.publishedAt === "string" ? a.publishedAt : "",
      });
    }
    return articles.length > 0 ? articles : null;
  } catch {
    return null;
  }
}

async function readSaved(key: string, requireFresh: boolean): Promise<Saved | null> {
  const row = await Cache.findOne(
    requireFresh ? { key, expiresAt: { $gt: new Date() } } : { key }
  ).lean();
  return row ? (row.value as Saved) : null;
}

async function save(key: string, value: unknown, seconds: number) {
  await Cache.updateOne(
    { key },
    { $set: { value, expiresAt: new Date(Date.now() + seconds * 1000) } },
    { upsert: true }
  );
}

// Never throws. Order: fresh copy, then a new request, then the older copy, then "unavailable".
export async function getNews(): Promise<NewsResult> {
  try {
    const fresh = await readSaved("news:fresh", true);
    if (fresh) return { articles: fresh.articles, status: "fresh", savedAt: fresh.savedAt };

    const waiting = await Cache.findOne({ key: "news:retry", expiresAt: { $gt: new Date() } }).lean();
    if (!waiting) {
      const articles = await fetchHeadlines();
      if (articles) {
        const saved: Saved = { articles, savedAt: new Date().toISOString() };
        await save("news:fresh", saved, NEWS_FRESH_SECONDS);
        await save("news:lastgood", saved, NEWS_KEEP_SECONDS);
        return { articles, status: "fresh", savedAt: saved.savedAt };
      }
      await save("news:retry", { at: Date.now() }, NEWS_RETRY_SECONDS);
    }

    const older = await readSaved("news:lastgood", false);
    if (older) return { articles: older.articles, status: "older", savedAt: older.savedAt };
  } catch {
    // Fall through to the friendly "unavailable" answer.
  }
  return { articles: [], status: "unavailable", savedAt: null };
}