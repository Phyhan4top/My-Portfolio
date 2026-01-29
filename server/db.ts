import { MongoClient, type Db } from "mongodb";

const mongoUri = process.env.MONGODB_URI || process.env.DB_URL;

if (!mongoUri) {
  throw new Error("MONGODB_URI (or DB_URL) must be set.");
}

const client = new MongoClient(mongoUri);
const clientPromise = client.connect();

export async function getDb(): Promise<Db> {
  const connected = await clientPromise;
  return connected.db(
    process.env.MONGODB_DB || process.env.DB_NAME || "portfolio",
  );
}
