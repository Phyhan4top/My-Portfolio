import { z } from "zod";

/* ---------------------------------- Contact --------------------------------- */

export const insertMessageSchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(120, "That name is too long."),
  email: z.string().trim().email("That email address doesn't look right.").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Tell me a little more, at least a sentence.")
    .max(5000, "Please keep the message under 5,000 characters."),
  /** Honeypot. Hidden from people, so only bots fill it in. */
  website: z.string().max(200).optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export const uploadResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  filename: z.string(),
  contentType: z.string(),
});

/* --------------------------------- Portfolio -------------------------------- */

const linkSchema = z.object({ label: z.string(), href: z.string() });

const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string(),
  width: z.number(),
  height: z.number(),
  /** Groups the image into a numbered step of a user journey. */
  step: z.string().optional(),
  /** Too small to read on a phone, where a phone-sized version takes over. */
  desktopOnly: z.boolean().optional(),
});

/** Interactive miniatures that a project can open with. */
export const figureSchema = z.enum([
  "order-trace",
  "canvas-mini",
  "role-lens",
  "safe-browser",
  "exam-browser",
]);

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes."),
  name: z.string(),
  context: z.string(),
  period: z.string(),
  role: z.string(),
  status: z.string(),
  /** One or two sentences, used on the index and in page metadata. */
  summary: z.string(),
  contribution: z.array(z.string()),
  stack: z.array(z.string()),
  challenges: z.array(z.object({ title: z.string(), body: z.string() })),
  images: z.array(imageSchema),
  figure: figureSchema.optional(),
  links: z.array(linkSchema),
  /** Plain statement of what can't be shown publicly, and why. */
  note: z.string().optional(),
});

export const roleSchema = z.object({
  company: z.string(),
  companyUrl: z.string().optional(),
  role: z.string(),
  place: z.string(),
  /** ISO month, e.g. "2025-04". */
  start: z.string().regex(/^\d{4}-\d{2}$/),
  /** ISO month, or null while the role is current. */
  end: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
  points: z.array(z.string()),
  projectSlug: z.string().optional(),
  /** Further case studies from the same job. */
  moreProjects: z.array(z.object({ label: z.string(), slug: z.string() })).optional(),
});

export const skillTier = z.enum(["daily", "regular", "familiar"]);

export const portfolioSchema = z.object({
  identity: z.object({
    fullName: z.string(),
    shortName: z.string(),
    title: z.string(),
    location: z.string(),
    availability: z.string(),
    email: z.string().email(),
    cvUrl: z.string(),
    socials: z.array(linkSchema),
  }),
  intro: z.object({
    statement: z.string(),
    /** Parts of the statement to underline, matched exactly. */
    emphasis: z.array(z.string()),
  }),
  practice: z.object({
    paragraphs: z.array(z.string()),
    portrait: imageSchema,
    notes: z.array(z.object({ title: z.string(), body: z.string(), source: z.string() })),
  }),
  /** Order matters: the first three get a full spread on the home page. */
  projects: z.array(projectSchema),
  record: z.object({
    roles: z.array(roleSchema),
    education: z.object({
      degree: z.string(),
      school: z.string(),
      place: z.string(),
      period: z.string(),
    }),
  }),
  toolkit: z.array(
    z.object({
      group: z.string(),
      items: z.array(z.object({ name: z.string(), tier: skillTier, where: z.string() })),
    }),
  ),
  contact: z.object({ heading: z.string(), body: z.string() }),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof messageSchema>;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type PortfolioData = z.infer<typeof portfolioSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Role = z.infer<typeof roleSchema>;
export type SkillTier = z.infer<typeof skillTier>;
