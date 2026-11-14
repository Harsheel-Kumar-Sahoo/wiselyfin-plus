// Exports every collection to JSON files in the backups folder.
import { mkdir, writeFile } from "node:fs/promises";
import { EJSON } from "bson";
import { MongoClient } from "mongodb";

const uri = process.env.BACKUP_MONGODB_URI ?? process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing BACKUP_MONGODB_URI (or MONGODB_URI).");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri as string, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db("wiselyfin");
  await mkdir("backups", { recursive: true });

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  let total = 0;
  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray();
    await writeFile(`backups/${name}.json`, EJSON.stringify(docs, undefined, 2, { relaxed: false }));
    console.log(`Exported ${name}: ${docs.length} documents`);
    total += docs.length;
  }
  await client.close();
  console.log(`Backup finished: ${collections.length} collections, ${total} documents.`);
}

main().catch((err) => {
  console.error("Backup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});