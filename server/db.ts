import { MongoClient, type Db } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

/**
 * Connects on first use, so a database outage can't take the whole site down:
 * the frontend and its bundled content keep working. A failed attempt is
 * forgotten so that the next request can try again.
 */
export async function getDb(): Promise<Db> {
  const mongoUri = process.env.MONGODB_URI || process.env.DB_URL;
  if (!mongoUri) {
    throw new Error("MONGODB_URI (or DB_URL) must be set.");
  }

  if (!clientPromise) {
    // Serverless instances each hold their own pool, so keep it small and fail fast.
    const client = new MongoClient(mongoUri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 });
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || process.env.DB_NAME || "portfolio");
}
