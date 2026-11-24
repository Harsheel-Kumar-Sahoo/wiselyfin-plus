// Puts the learning content into the database. Safe to run again: it updates by slug.
import mongoose from "mongoose";
import { connectDb } from "../server/db/connect.js";
import { Lesson } from "../server/models/Lesson.js";
import { Path } from "../server/models/Path.js";
import { allPaths } from "./seed-data/index.js";
import { LANGS, translations, type TransLang } from "./seed-data/translations/index.js";

type Multi = { en: string } & Partial<Record<TransLang, string>>;

// English text plus every translation that exists and is not empty.
function multi(en: string, get: (lang: TransLang) => string | undefined): Multi {
  const out: Multi = { en };
  for (const lang of LANGS) {
    const value = get(lang);
    if (value && value.trim()) out[lang] = value;
  }
  return out;
}

async function main() {
  await connectDb();
  let lessonCount = 0;
  const translated: Record<string, number> = { hi: 0, ta: 0, te: 0, bn: 0 };

  for (const p of allPaths) {
    const pt = (lang: TransLang) => translations[lang][p.slug];

    const path = await Path.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          title: multi(p.title, (l) => pt(l)?.title),
          description: multi(p.description, (l) => pt(l)?.description),
          icon: p.icon,
          order: p.order,
          completionCoins: p.completionCoins,
          published: true,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    if (!path) throw new Error(`Could not save path ${p.slug}`);

    for (const l of p.lessons) {
      const lt = (lang: TransLang) => pt(lang)?.lessons[l.slug];

      // Safety check: a translation must match the English exactly in shape,
      // because the correct answer is stored by position.
      for (const lang of LANGS) {
        const t = lt(lang);
        if (!t) continue;
        if (t.questions.length !== l.questions.length) {
          throw new Error(`${lang}/${l.slug}: expected ${l.questions.length} questions, found ${t.questions.length}`);
        }
        l.questions.forEach((q, i) => {
          if (t.questions[i]?.options.length !== q.options.length) {
            throw new Error(`${lang}/${l.slug}: question ${i + 1} has a different number of options than the English`);
          }
        });
        translated[lang] = (translated[lang] ?? 0) + 1;
      }

      await Lesson.findOneAndUpdate(
        { slug: l.slug },
        {
          $set: {
            pathId: path._id,
            order: l.order,
            title: multi(l.title, (g) => lt(g)?.title),
            body: multi(l.body, (g) => lt(g)?.body),
            rewardCoins: l.rewardCoins ?? 10,
            rewardXp: l.rewardXp ?? 20,
            published: true,
            questions: l.questions.map((q, i) => ({
              prompt: multi(q.prompt, (g) => lt(g)?.questions[i]?.prompt),
              options: q.options.map((o, j) => multi(o, (g) => lt(g)?.questions[i]?.options[j])),
              correctIndex: q.correctIndex,
              explanation: multi(q.explanation, (g) => lt(g)?.questions[i]?.explanation),
            })),
          },
        },
        { upsert: true }
      );
      lessonCount += 1;
    }
  }

  console.log(`Seeded ${allPaths.length} path(s) and ${lessonCount} lesson(s).`);
  console.log(
    `Translated lessons: Hindi ${translated.hi}, Tamil ${translated.ta}, Telugu ${translated.te}, Bengali ${translated.bn}.`
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});