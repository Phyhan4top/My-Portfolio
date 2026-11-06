import { readFile, writeFile } from "fs/promises";
import path from "path";
import { FALLBACK_SITE_URL, resolveSiteUrl } from "../shared/site-url";

/** robots.txt and sitemap.xml are copied as they are, so their address is filled in here. */
export async function applySiteUrl(publicDir: string) {
  const siteUrl = resolveSiteUrl();
  for (const file of ["robots.txt", "sitemap.xml"]) {
    const target = path.join(publicDir, file);
    const content = await readFile(target, "utf-8");
    await writeFile(target, content.replaceAll(FALLBACK_SITE_URL, siteUrl));
  }
  return siteUrl;
}
