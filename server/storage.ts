import { getDb } from "./db";
import { ObjectId } from "mongodb";
import { type InsertMessage, type Message, type PortfolioData, portfolioSchema } from "@shared/schema";
import { defaultPortfolio } from "@shared/content";

/**
 * The redesign has a new content shape, so it uses its own document. The older
 * "primary" document is left untouched in the database.
 */
const PORTFOLIO_DOC_ID = "portfolio-v2";

type PortfolioDocument = {
  _id: string;
  data: PortfolioData;
  updatedAt: Date;
};

type MessageDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
};

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getPortfolio(): Promise<PortfolioData>;
  getEditablePortfolio(): Promise<{ data: PortfolioData; source: "saved" | "code" | "invalid" }>;
  updatePortfolio(portfolio: PortfolioData): Promise<PortfolioData>;
}

export class MongoStorage implements IStorage {
  async createMessage({ name, email, message }: InsertMessage): Promise<Message> {
    const db = await getDb();
    const createdAt = new Date();
    const result = await db
      .collection<MessageDocument>("messages")
      .insertOne({ name, email, message, createdAt });

    return {
      id: result.insertedId.toHexString(),
      name,
      email,
      message,
      createdAt: createdAt.toISOString(),
    };
  }

  /** Returns the saved copy if a valid one exists, otherwise the code's content. Never writes. */
  async getPortfolio(): Promise<PortfolioData> {
    try {
      const db = await getDb();
      const existing = await db
        .collection<PortfolioDocument>("portfolio")
        .findOne({ _id: PORTFOLIO_DOC_ID });

      if (!existing) return defaultPortfolio;

      const parsed = portfolioSchema.safeParse(existing.data);
      if (parsed.success) return parsed.data;

      console.error("Saved portfolio failed validation; serving bundled content.");
      return defaultPortfolio;
    } catch (error) {
      console.error("Could not read portfolio; serving bundled content.", error);
      return defaultPortfolio;
    }
  }

  /**
   * For the editor. A database failure throws here, because quietly opening the
   * code's content could overwrite real edits on the next save.
   */
  async getEditablePortfolio(): Promise<{ data: PortfolioData; source: "saved" | "code" | "invalid" }> {
    const db = await getDb();
    const existing = await db
      .collection<PortfolioDocument>("portfolio")
      .findOne({ _id: PORTFOLIO_DOC_ID });

    if (!existing) return { data: defaultPortfolio, source: "code" };

    const parsed = portfolioSchema.safeParse(existing.data);
    return parsed.success
      ? { data: parsed.data, source: "saved" }
      : { data: defaultPortfolio, source: "invalid" };
  }

  async updatePortfolio(portfolio: PortfolioData): Promise<PortfolioData> {
    const db = await getDb();
    await db
      .collection<PortfolioDocument>("portfolio")
      .updateOne(
        { _id: PORTFOLIO_DOC_ID },
        { $set: { data: portfolio, updatedAt: new Date() } },
        { upsert: true },
      );
    return portfolio;
  }
}

export const storage = new MongoStorage();
