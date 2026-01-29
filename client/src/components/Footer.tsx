import { Code2 } from "lucide-react";
import type { PortfolioData } from "@shared/schema";

type FooterProps = {
  brand: PortfolioData["brand"];
  footer: PortfolioData["footer"];
};

export function Footer({ brand, footer }: FooterProps) {
  return (
    <footer className="py-8 border-t border-border bg-card">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg">
            {brand.name}
            <span className="text-primary">{brand.accent}</span>
          </span>
        </div>

        <p className="text-sm text-muted-foreground text-center md:text-right">
          (c) {new Date().getFullYear()} {footer.copyrightName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
