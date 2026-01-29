import { z } from "zod";

export const insertMessageSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("A valid email is required."),
  message: z.string().min(1, "Message is required."),
});

export const messageSchema = insertMessageSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

export const uploadResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  filename: z.string(),
  contentType: z.string(),
});

export const heroSocialIconSchema = z.enum(["github", "linkedin", "email"]);
export const aboutHighlightIconSchema = z.enum([
  "user",
  "briefcase",
  "mapPin",
  "graduationCap",
]);
export const skillCategoryIconSchema = z.enum([
  "layout",
  "server",
  "smartphone",
  "penTool",
  "code",
  "database",
]);

const urlOrPathSchema = z.string().refine(
  (value) =>
    value === "" ||
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://"),
  "Must be a full URL or start with /",
);

export const portfolioSchema = z.object({
  brand: z.object({
    name: z.string(),
    accent: z.string(),
  }),
  hero: z.object({
    availability: z.string(),
    greeting: z.string(),
    name: z.string(),
    subheadline: z.string(),
    highlights: z.array(z.string()),
    primaryCta: z.object({
      label: z.string(),
      href: z.string(),
    }),
    secondaryCta: z.object({
      label: z.string(),
      href: z.string(),
      newTab: z.boolean(),
    }),
    socials: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        icon: heroSocialIconSchema,
      }),
    ),
    profileCard: z.object({
      name: z.string(),
      location: z.string(),
      stats: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      ),
    }),
    image: z.object({
      url: urlOrPathSchema,
      alt: z.string().optional(),
    }),
  }),
  about: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
    highlights: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        icon: aboutHighlightIconSchema,
      }),
    ),
  }),
  skills: z.object({
    heading: z.string(),
    subheading: z.string(),
    categories: z.array(
      z.object({
        title: z.string(),
        icon: skillCategoryIconSchema,
        skills: z.array(z.string()),
      }),
    ),
  }),
  experience: z.object({
    heading: z.string(),
    items: z.array(
      z.object({
        company: z.string(),
        role: z.string(),
        period: z.string(),
        description: z.string(),
      }),
    ),
  }),
  projects: z.object({
    heading: z.string(),
    subheading: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        image: z.string(),
        links: z.object({
          demo: z.string(),
          github: z.string(),
        }),
      }),
    ),
  }),
  contact: z.object({
    heading: z.string(),
    body: z.string(),
    email: z.string().email(),
    location: z.string(),
  }),
  footer: z.object({
    copyrightName: z.string(),
  }),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof messageSchema>;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type PortfolioData = z.infer<typeof portfolioSchema>;

export const defaultPortfolio: PortfolioData = {
  brand: {
    name: "Ajose",
    accent: ".dev",
  },
  hero: {
    availability: "Available for work",
    greeting: "Hi, I'm",
    name: "Ajose Oyedepo",
    subheadline:
      "A creative Front-End Software Engineer specializing in building exceptional digital experiences with",
    highlights: ["React", "Next.js", "Vue.js"],
    primaryCta: {
      label: "View Projects",
      href: "#projects",
    },
    secondaryCta: {
      label: "Download CV",
      href: "/resume.pdf",
      newTab: true,
    },
    socials: [
      {
        label: "GitHub",
        href: "https://github.com/ajoseoyedepo",
        icon: "github",
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/in/ajoseoyedepo",
        icon: "linkedin",
      },
      {
        label: "Email",
        href: "mailto:ajoseoyedepo@gmail.com",
        icon: "email",
      },
    ],
    profileCard: {
      name: "Ajose Oyedepo",
      location: "Lagos, Nigeria",
      stats: [
        { label: "Experience", value: "2+ Years" },
        { label: "Projects", value: "15+ Done" },
      ],
    },
    image: {
      url: "",
      alt: "Ajose Oyedepo portrait",
    },
  },
  about: {
    heading: "About Me",
    paragraphs: [
      "I am a passionate Front-End Software Engineer based in Lagos, Nigeria. With a strong foundation in Computer Science from the University of Ilorin, I specialize in building efficient, accessible, and high-performance web applications.",
      "My journey involves creating sophisticated dashboards, intuitive design tools, and robust e-commerce platforms. I thrive on solving complex problems with clean code and modern technologies like React, Vue.js, and Next.js.",
    ],
    highlights: [
      { icon: "user", label: "Experience", value: "2+ Years" },
      { icon: "briefcase", label: "Role", value: "Frontend Eng." },
      { icon: "mapPin", label: "Location", value: "Lagos, NG" },
      { icon: "graduationCap", label: "Education", value: "B.Sc CS" },
    ],
  },
  skills: {
    heading: "Technical Skills",
    subheading:
      "A comprehensive toolkit that enables me to build end-to-end solutions.",
    categories: [
      {
        title: "Frontend & Frameworks",
        icon: "layout",
        skills: [
          "React.js",
          "Vue.js",
          "Next.js",
          "Redux",
          "Tailwind CSS",
          "TypeScript",
          "JavaScript",
        ],
      },
      {
        title: "Backend & APIs",
        icon: "server",
        skills: ["Node.js", "Express.js", "Nest.js", "RESTful APIs", "PostgreSQL"],
      },
      {
        title: "Mobile Development",
        icon: "smartphone",
        skills: ["React Native", "Ionic", "Responsive Design", "PWA"],
      },
      {
        title: "Tools & Design",
        icon: "penTool",
        skills: ["Git & GitHub", "Figma", "Webflow", "VS Code", "Vercel"],
      },
    ],
  },
  experience: {
    heading: "Professional Journey",
    items: [
      {
        company: "Chronicles Software Dev Company",
        role: "Application/Web Developer",
        period: "Apr 2025 - Present",
        description:
          "Building interactive dashboards and optimizing the SuccessTab platform for improved user engagement and performance.",
      },
      {
        company: "Skyestudio",
        role: "Software Engineer",
        period: "Jun 2024 - Mar 2025",
        description:
          "Developed Skye Editor, a complex web-based design tool using Vue.js and Fabric.js with advanced canvas manipulation features.",
      },
      {
        company: "Tino",
        role: "Frontend Engineer",
        period: "Mar 2023 - Jun 2024",
        description:
          "Architected and built a high-performance e-commerce application using Next.js, focusing on SEO and conversion optimization.",
      },
      {
        company: "Kryzotech",
        role: "Software Developer",
        period: "Dec 2022 - Mar 2023",
        description:
          "Developed responsive user interfaces and robust RESTful APIs for various client projects.",
      },
    ],
  },
  projects: {
    heading: "Featured Projects",
    subheading: "A selection of my recent work building scalable web applications.",
    items: [
      {
        title: "Skye Editor",
        description:
          "A sophisticated web-based design tool enabling users to create and manipulate graphics directly in the browser.",
        tags: ["Vue.js", "Fabric.js", "Canvas API", "TypeScript"],
        image:
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        links: { demo: "#", github: "#" },
      },
      {
        title: "E-commerce Platform",
        description:
          "Full-featured online shopping platform with cart management, secure checkout, and product filtering.",
        tags: ["Next.js", "Redux", "Stripe", "Tailwind"],
        image:
          "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
        links: { demo: "#", github: "#" },
      },
      {
        title: "Learning Dashboard",
        description:
          "Educational content management system featuring student progress tracking and interactive course materials.",
        tags: ["React", "Recharts", "Node.js", "PostgreSQL"],
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        links: { demo: "#", github: "#" },
      },
    ],
  },
  contact: {
    heading: "Let's work together",
    body:
      "I'm currently available for freelance projects and full-time opportunities. If you have a project that needs some creative touch, I'd love to hear about it.",
    email: "ajoseoyedepo@gmail.com",
    location: "Lagos, Nigeria",
  },
  footer: {
    copyrightName: "Ajose Oyedepo",
  },
};
