import { z } from "zod";
import {
  insertMessageSchema,
  messageSchema,
  portfolioSchema,
  uploadResponseSchema,
} from "./schema";

/** Below the 4.5 MB request limit on Vercel, including the form's own overhead. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  contact: {
    submit: {
      method: "POST" as const,
      path: "/api/contact",
      input: insertMessageSchema,
      responses: {
        201: messageSchema,
        400: errorSchemas.validation,
      },
    },
  },
  portfolio: {
    get: {
      method: "GET" as const,
      path: "/api/portfolio",
      responses: {
        200: portfolioSchema,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/portfolio",
      input: portfolioSchema,
      responses: {
        200: portfolioSchema,
        400: errorSchemas.validation,
        401: errorSchemas.internal,
      },
    },
  },
  admin: {
    /** What the editor starts from. Unlike the public route, a database failure is an error here. */
    portfolio: {
      method: "GET" as const,
      path: "/api/admin/portfolio",
      responses: {
        200: z.object({
          data: portfolioSchema,
          source: z.enum(["saved", "code", "invalid"]),
        }),
      },
    },
  },
  uploads: {
    create: {
      method: "POST" as const,
      path: "/api/uploads",
      responses: {
        201: uploadResponseSchema,
        400: errorSchemas.validation,
        401: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MessageInput = z.infer<typeof api.contact.submit.input>;
export type PortfolioInput = z.infer<typeof api.portfolio.update.input>;
