import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { api, MAX_UPLOAD_BYTES } from "@shared/routes";
import { z } from "zod";
import { sendContactEmail } from "./email";
import { getDb } from "./db";
import multer from "multer";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";
import { createHash, timingSafeEqual } from "crypto";

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

  // Comparing digests keeps the check constant-time, whatever the token's length.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(token), digest(adminToken))) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  return true;
}

/** How long a visitor waits on the email before they get a response anyway. */
const EMAIL_WAIT_MS = 8000;

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

/**
 * Small per-IP limit on the contact form. It's kept in memory, so on serverless
 * hosting each running instance counts separately. The honeypot and the size
 * limits on messages still apply everywhere.
 */
const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_MAX_PER_WINDOW = 5;
const contactAttempts = new Map<string, { count: number; resetAt: number }>();

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  contactAttempts.forEach((entry, key) => {
    if (entry.resetAt <= now) contactAttempts.delete(key);
  });

  const entry = contactAttempts.get(ip);
  if (!entry) {
    contactAttempts.set(ip, { count: 1, resetAt: now + CONTACT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > CONTACT_MAX_PER_WINDOW;
}

export function registerRoutes(app: Express) {
  app.post(api.contact.submit.path, async (req, res) => {
    if (isContactRateLimited(req.ip ?? "unknown")) {
      return res.status(429).json({
        message: "That's a few messages in a short time. Please try again in a few minutes.",
      });
    }

    try {
      const input = api.contact.submit.input.parse(req.body);

      // A filled honeypot means a bot. Look successful, but keep nothing.
      if (input.website) {
        return res.status(201).json({
          id: "0",
          name: input.name,
          email: input.email,
          message: input.message,
          createdAt: new Date().toISOString(),
        });
      }

      const message = await storage.createMessage(input);

      // Serverless platforms can freeze a function once it responds, so the email
      // gets its chance first. The message is already saved, so a slow or failing
      // mail server only delays the visitor briefly and never loses the message.
      let timer: NodeJS.Timeout | undefined;
      await Promise.race([
        sendContactEmail(input).catch((error) => {
          console.error("Failed to send contact email:", error);
        }),
        new Promise<void>((resolve) => {
          timer = setTimeout(() => {
            console.error("Contact email is taking too long; responding anyway.");
            resolve();
          }, EMAIL_WAIT_MS);
        }),
      ]);
      clearTimeout(timer);

      res.status(201).json(message);
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

  app.get(api.admin.portfolio.path, async (req, res) => {
    if (!verifyAdminToken(req, res)) {
      return;
    }
    res.status(200).json(await storage.getEditablePortfolio());
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

  // An unknown API route is a 404, not the app shell.
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found." });
  });

}
