import { useEffect } from "react";

const SITE_URL = import.meta.env.VITE_SITE_URL as string;

function setMeta(selector: string, content: string) {
  document.head.querySelector(selector)?.setAttribute("content", content);
}

/** Keeps the document title, description and canonical URL in step with the route. */
export function useSeo({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  }, [title, description, path]);
}
