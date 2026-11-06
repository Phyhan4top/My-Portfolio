import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { defaultPortfolio } from "@shared/content";
import type { PortfolioData } from "@shared/schema";

export const PORTFOLIO_QUERY_KEY = [api.portfolio.get.path];

/**
 * Content is bundled, so the page renders immediately, even while a free-tier
 * server wakes up. If a copy has been saved from /admin it replaces this quietly.
 */
export function usePortfolio(): PortfolioData {
  const { data } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(api.portfolio.get.path);
      if (!res.ok) throw new Error("Failed to load portfolio.");
      return api.portfolio.get.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });

  return data ?? defaultPortfolio;
}
