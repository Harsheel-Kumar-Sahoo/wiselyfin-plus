import crypto from "node:crypto";
import { Lesson } from "../models/Lesson.js";

export type DailyQuestion = {
  id: string;
  prompt: { en: string; hi?: string | null; ta?: string | null; te?: string | null; bn?: string | null };
  options: Array<{ en: string; hi?: string | null; ta?: string | null; te?: string | null; bn?: string | null }>;
  correctIndex: number;
  explanation: { en: string; hi?: string | null; ta?: string | null; te?: string | null; bn?: string | null };
};

// Everyone gets the same question on the same day. It is picked from the lesson questions.
export async function getDailyQuestion(day: string): Promise<DailyQuestion | null> {
  const lessons = await Lesson.find({ published: true }).select("slug questions").lean();

  const all: Array<{ key: string; q: DailyQuestion }> = [];
  for (const lesson of lessons) {
    lesson.questions.forEach((q, i) => {
      all.push({
        key: `${lesson.slug}:${String(i).padStart(3, "0")}`,
        q: {
          id: String(q._id),
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        },
      });
    });
  }
  if (all.length === 0) return null;

  all.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const hash = crypto.createHash("sha256").update(day).digest("hex");
  const index = parseInt(hash.slice(0, 8), 16) % all.length;
  return all[index]?.q ?? null;
}