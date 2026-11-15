// Puts the starter learning content into the database. Safe to run again: it updates by slug.
import mongoose from "mongoose";
import { connectDb } from "../server/db/connect.js";
import { Lesson } from "../server/models/Lesson.js";
import { Path } from "../server/models/Path.js";
import { allPaths } from "./seed-data/index.js";

async function main() {
  await connectDb();
  let lessonCount = 0;

  for (const p of allPaths) {
    // Dotted names such as "title.en" keep any translations added later.
    const path = await Path.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          "title.en": p.title,
          "description.en": p.description,
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
      await Lesson.findOneAndUpdate(
        { slug: l.slug },
        {
          $set: {
            pathId: path._id,
            order: l.order,
            "title.en": l.title,
            "body.en": l.body,
            rewardCoins: l.rewardCoins ?? 10,
            rewardXp: l.rewardXp ?? 20,
            published: true,
            questions: l.questions.map((q) => ({
              prompt: { en: q.prompt },
              options: q.options.map((o) => ({ en: o })),
              correctIndex: q.correctIndex,
              explanation: { en: q.explanation },
            })),
          },
        },
        { upsert: true }
      );
      lessonCount += 1;
    }
  }

  console.log(`Seeded ${allPaths.length} path(s) and ${lessonCount} lesson(s).`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});