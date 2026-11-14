import { MongoClient } from "mongodb";

type Res = {
  status: (code: number) => { json: (body: unknown) => void };
};

let client: MongoClient | null = null;

export default async function handler(_req: unknown, res: Res) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ ok: false, database: "missing MONGODB_URI" });
      return;
    }
    if (!client) {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    }
    await client.db("wiselyfin").command({ ping: 1 });
    res.status(200).json({ ok: true, database: "connected" });
  } catch {
    client = null;
    res.status(503).json({ ok: false, database: "unreachable" });
  }
}