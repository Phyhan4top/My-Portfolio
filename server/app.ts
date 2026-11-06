import express, { type NextFunction, type Request, type Response } from "express";
import { MulterError } from "multer";
import { registerRoutes } from "./routes";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * The API, with nothing about how it's hosted. A long-running server listens
 * with it (server/index.ts), and Vercel calls it per request (server/vercel.ts).
 */
export function createApp() {
  const app = express();

  // A hosting proxy sits in front of the app, so req.ip should come from its header.
  app.set("trust proxy", 1);

  app.use(
    express.json({
      // The whole portfolio is saved in one request, so the 100 KB default is too tight.
      limit: "1mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  // Response bodies stay out of the logs: they can hold visitors' contact details.
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
      if (path.startsWith("/api")) {
        log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`);
      }
    });

    next();
  });

  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "That file is too large. Please use one under 4 MB." : "That upload didn't work.";
      return res.status(400).json({ message, field: "file" });
    }

    const status = err.status || err.statusCode || 500;
    // Server faults stay in the logs: their messages can expose infrastructure.
    const message = status >= 500 ? "Internal Server Error" : err.message;

    console.error("Internal Server Error:", err);

    return res.status(status).json({ message });
  });

  return app;
}
