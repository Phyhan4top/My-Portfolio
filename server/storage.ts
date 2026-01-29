import { getDb } from "./db";
import { ObjectId } from "mongodb";
import {
  type InsertMessage,
  type Message,
  type PortfolioData,
  defaultPortfolio,
} from "@shared/schema";

const PORTFOLIO_DOC_ID = "primary";

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
  updatePortfolio(portfolio: PortfolioData): Promise<PortfolioData>;
}

export class MongoStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const db = await getDb();
    const createdAt = new Date();
    const result = await db.collection<MessageDocument>("messages").insertOne({
      ...insertMessage,
      createdAt,
    });

    return {
      id: result.insertedId.toHexString(),
      ...insertMessage,
      createdAt: createdAt.toISOString(),
    };
  }

  async getPortfolio(): Promise<PortfolioData> {
    const db = await getDb();
    const collection = db.collection<PortfolioDocument>("portfolio");
    const existing = await collection.findOne({ _id: PORTFOLIO_DOC_ID });

    if (existing?.data) {
      return existing.data;
    }

    const seeded = {
      _id: PORTFOLIO_DOC_ID,
      data: defaultPortfolio,
      updatedAt: new Date(),
    };
    await collection.insertOne(seeded);
    return seeded.data;
  }

  async updatePortfolio(portfolio: PortfolioData): Promise<PortfolioData> {
    const db = await getDb();
    const collection = db.collection<PortfolioDocument>("portfolio");
    await collection.updateOne(
      { _id: PORTFOLIO_DOC_ID },
      { $set: { data: portfolio, updatedAt: new Date() } },
      { upsert: true },
    );
    return portfolio;
  }
}

export const storage = new MongoStorage();
