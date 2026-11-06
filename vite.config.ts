import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { resolveSiteUrl } from "./shared/site-url";

// Vite fills this in as %VITE_SITE_URL% in index.html, and exposes it to the app.
process.env.VITE_SITE_URL = resolveSiteUrl();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
