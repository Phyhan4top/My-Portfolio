import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "./app";

const app = createApp();

/**
 * Vercel's entry point. Every /api route is sent to this one function, with the
 * original path also passed as ?path=, so the app sees the URL it expects
 * whether or not the platform keeps the original one on the request.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.searchParams.get("path");
  url.searchParams.delete("path");

  const pathname = url.pathname === "/api/handler" && path !== null ? `/api/${path}` : url.pathname;
  req.url = `${pathname}${url.search}`;

  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
