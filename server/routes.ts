import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { sendContactEmail } from "./email";
import { getDb } from "./db";
import multer from "multer";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

function verifyAdminToken(req: Request, res: Response): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    res.status(500).json({ message: "ADMIN_TOKEN is not configured." });
    return false;
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (token !== adminToken) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  return true;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);

      // Do not block client response on SMTP availability in production.
      void sendContactEmail(input).catch((error) => {
        console.error("Failed to send contact email:", error);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.portfolio.get.path, async (_req, res) => {
    const portfolio = await storage.getPortfolio();
    res.status(200).json(portfolio);
  });

  app.put(api.portfolio.update.path, async (req, res) => {
    if (!verifyAdminToken(req, res)) {
      return;
    }

    try {
      const input = api.portfolio.update.input.parse(req.body);
      const updated = await storage.updatePortfolio(input);
      res.status(200).json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.post(
    api.uploads.create.path,
    upload.single("file"),
    async (req, res) => {
      if (!verifyAdminToken(req, res)) {
        return;
      }

      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ message: "File is required.", field: "file" });
      }

      if (!file.buffer || file.size === 0) {
        return res
          .status(400)
          .json({ message: "File is empty.", field: "file" });
      }

      if (!allowedMimeTypes.has(file.mimetype)) {
        return res.status(400).json({
          message: "Unsupported file type. Use PNG, JPG, WEBP, GIF, or PDF.",
          field: "file",
        });
      }

      const db = await getDb();
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: {
          uploadedAt: new Date(),
        },
      });

      const source = Readable.from(file.buffer);
      source.pipe(uploadStream);

      await new Promise<void>((resolve, reject) => {
        uploadStream.on("finish", () => resolve());
        uploadStream.on("error", (err) => reject(err));
      });

      const id = uploadStream.id.toString();
      const url = `/api/uploads/${id}`;

      return res.status(201).json({
        id,
        url,
        filename: file.originalname,
        contentType: file.mimetype,
      });
    },
  );

  app.get("/api/uploads/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid file id.", field: "id" });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const fileId = new ObjectId(id);
    const filesCollection = db.collection<{
      _id: ObjectId;
      filename?: string;
      contentType?: string;
    }>("uploads.files");
    const fileDoc = await filesCollection.findOne({ _id: fileId });

    if (!fileDoc) {
      return res.status(404).json({ message: "File not found." });
    }

    res.setHeader(
      "Content-Type",
      fileDoc.contentType || "application/octet-stream",
    );

    if (fileDoc.contentType === "application/pdf") {
      const filename = fileDoc.filename || "document.pdf";
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", () => {
      res.status(404).json({ message: "File not found." });
    });
    downloadStream.pipe(res);
  });

  return httpServer;
}
