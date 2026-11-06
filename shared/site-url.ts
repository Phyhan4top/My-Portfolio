/** The site's public address. Set SITE_URL when building to use a different one. */
export const DEFAULT_SITE_URL = "https://ajose-oyedepo.vercel.app";

export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  return (env.SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}
