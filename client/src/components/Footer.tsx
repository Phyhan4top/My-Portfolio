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
          {brand.logo?.url ? (
            <img
              src={brand.logo.url}
              alt={brand.logo.alt || "Logo"}
              className="h-20 w-[100px] rounded-md object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary/10" />
          )}
          <span className="sr-only">
            {brand.logo?.alt || `${brand.name}${brand.accent}`}
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
