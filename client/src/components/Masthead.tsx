import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { SHEETS, type SheetId } from "@/lib/sheets";
import { SiteLink } from "./SiteLink";

const NAV = SHEETS.filter((sheet) => sheet.id !== "intro");

/** Which sheet currently fills the middle of the viewport. */
function useActiveSheet(enabled: boolean): SheetId {
  const [active, setActive] = useState<SheetId>("intro");

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SheetId);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const sheet of SHEETS) {
      const element = document.getElementById(sheet.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

/** Tucks away while reading downward, and comes back as soon as you scroll up. */
function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last.current) < 8) return;
      setHidden(y > last.current && y > 240);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export function Masthead() {
  const [path] = useLocation();
  const onHome = path === "/";
  const activeOnHome = useActiveSheet(onHome);
  const active: SheetId = onHome ? activeOnHome : "work";
  const hidden = useHideOnScroll();
  const [indexOpen, setIndexOpen] = useState(false);
  const indexButton = useRef<HTMLButtonElement>(null);
  const indexList = useRef<HTMLUListElement>(null);
  const activeSheet = SHEETS.find((sheet) => sheet.id === active)!;

  useEffect(() => {
    if (!indexOpen) return;
    indexList.current?.querySelector("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIndexOpen(false);
        indexButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indexOpen]);

  return (
    <>
      <a
        href="#main"
        className="t-mono fixed left-2 top-2 z-50 -translate-y-20 bg-pen px-3 py-2 text-paper focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Title bar */}
      <header
        className={`gutter sticky top-0 z-40 flex h-12 items-center justify-between border-b border-ink bg-paper transition-transform duration-300 ${
          hidden && !indexOpen ? "-translate-y-full" : ""
        }`}
      >
        <SiteLink href="/" className="group flex items-baseline gap-3" aria-label="Phyhan, home">
          <span className="t-wide text-lg leading-none transition-colors group-hover:text-pen">Phyhan</span>
          <span className="t-label hidden sm:inline">Frontend Engineer</span>
        </SiteLink>

        <nav aria-label="Sheets" className="hidden md:block">
          <ul className="flex gap-6">
            {NAV.map((sheet) => (
              <li key={sheet.id}>
                <SiteLink
                  href={`/#${sheet.id}`}
                  aria-current={active === sheet.id ? "true" : undefined}
                  className={`t-mono inline-flex min-h-[44px] items-center gap-1.5 border-b-2 transition-colors hover:text-pen ${
                    active === sheet.id ? "border-pen text-pen" : "border-transparent"
                  }`}
                >
                  <span className="opacity-60">{sheet.no}</span>
                  {sheet.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <p className="t-label md:hidden">Lagos, NG</p>
      </header>

      {/* Margin note: where you are in the set. Large screens only. */}
      <p
        aria-hidden="true"
        className="t-label pointer-events-none fixed right-3 top-1/2 z-30 hidden origin-center [writing-mode:vertical-rl] 2xl:block"
      >
        Sheet {activeSheet.no} / {String(SHEETS.length).padStart(2, "0")} · {activeSheet.label}
      </p>

      {/* Phones get a thumb-reach dock instead of a hamburger in the far corner. */}
      <nav aria-label="Sheets" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper md:hidden">
        {indexOpen && (
          <ul id="sheet-index" ref={indexList} className="border-b border-ink">
            {SHEETS.map((sheet) => (
              <li key={sheet.id} className="hairline border-b last:border-b-0">
                <SiteLink
                  href={sheet.id === "intro" ? "/" : `/#${sheet.id}`}
                  onClick={() => setIndexOpen(false)}
                  className={`gutter flex min-h-[52px] items-center gap-4 ${active === sheet.id ? "text-pen" : ""}`}
                >
                  <span className="t-mono opacity-60">{sheet.no}</span>
                  <span className="t-head text-2xl">{sheet.label}</span>
                </SiteLink>
              </li>
            ))}
          </ul>
        )}
        <div className="gutter flex h-14 items-center justify-between">
          <p className="t-mono" aria-live="off">
            <span className="opacity-60">Sheet {activeSheet.no}</span> {activeSheet.label}
          </p>
          <button
            ref={indexButton}
            type="button"
            aria-expanded={indexOpen}
            aria-controls="sheet-index"
            onClick={() => setIndexOpen((open) => !open)}
            className="t-mono flex min-h-[44px] items-center gap-2 pl-4"
          >
            {indexOpen ? "Close" : "Index"}
            <span aria-hidden="true" className={`transition-transform ${indexOpen ? "rotate-180" : ""}`}>
              ↑
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
