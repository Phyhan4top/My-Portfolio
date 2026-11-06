/** The address the site was first published at, used when nothing else is set. */
export const FALLBACK_SITE_URL = "https://my-portfolio-9mpt.onrender.com";

/**
 * The site's public address, for canonical links, the sitemap and link previews.
 * SITE_URL wins (set it for a custom domain); otherwise Vercel's own production
 * address is used when building there.
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.SITE_URL?.trim()
    || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "")
    || FALLBACK_SITE_URL;
  return url.replace(/\/+$/, "");
}
