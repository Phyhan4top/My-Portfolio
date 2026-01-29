import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-card">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg">
            Ajose<span className="text-primary">.dev</span>
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground text-center md:text-right">
          © {new Date().getFullYear()} Ajose Oyedepo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
