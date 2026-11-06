import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PortfolioData } from "@shared/schema";

const SIDE_BEARINGS_EM = 0.135;
const LEFT_BEARING_EM = 0.082;

/**
 * The wordmark fills the sheet exactly. A dimension line above it reports its
 * true measured width, which is the kind of detail an engineer would check.
 */
function Wordmark({ name }: { name: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [folded, setFolded] = useState(true);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;

    const fit = () => {
      const boxWidth = box.clientWidth;
      const textWidth = measure.getBoundingClientRect().width;
      if (!textWidth) return;
      // The measuring copy is set at 100px. Taking out the empty side bearings
      // of the first and last letters lets the ink reach both edges of the sheet.
      setFontSize(boxWidth / (textWidth / 100 - SIDE_BEARINGS_EM));
      setWidth(Math.round(boxWidth));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
    // A different name has a different width, so it has to be fitted again.
  }, [name]);

  useEffect(() => {
    const timer = window.setTimeout(() => setFolded(false), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div className="dimension dimension-draw t-mono h-6" aria-hidden="true">
        <span />
        <span className="whitespace-nowrap bg-paper !relative !top-auto !mt-0 !h-auto !w-auto">
          {width ? `${width.toLocaleString("en-US")} px, measured live` : " "}
        </span>
        <span />
      </div>

      {/* Zero-sized wrapper: the 100px copy must never add to the page's scrollable width. */}
      <div className="invisible absolute left-0 top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <span ref={measureRef} className="wordmark !inline-block" style={{ fontSize: 100 }}>
          {name}
        </span>
      </div>

      <h1
        className="wordmark mt-3 select-none pb-[0.14em]"
        data-folded={folded}
        style={fontSize ? { fontSize, marginLeft: `-${LEFT_BEARING_EM}em` } : undefined}
        aria-label={name}
      >
        {Array.from(name).map((letter, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="wordmark-letter"
            style={{ "--i": index, whiteSpace: "pre" } as React.CSSProperties}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
}

function Statement({ statement, emphasis }: PortfolioData["intro"]) {
  const pattern = new RegExp(
    `(${emphasis.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  );
  return (
    <p className="t-statement">
      {statement.split(pattern).map((part, index) =>
        emphasis.includes(part) ? (
          <span key={index} className="pen-line">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

type IntroProps = {
  identity: PortfolioData["identity"];
  intro: PortfolioData["intro"];
};

export function Intro({ identity, intro }: IntroProps) {
  const meta = [
    ["Name", identity.fullName],
    ["Discipline", identity.title],
    ["Based in", identity.location],
    ["Status", identity.availability],
  ];

  return (
    <section id="intro" className="gutter pb-10 pt-4 md:pb-14" aria-label="Introduction">
      <Wordmark name={identity.shortName} />

      <div className="grid-12 mt-4 gap-y-10 md:mt-6">
        {/* Title block */}
        <dl className="order-2 col-span-12 border-t border-ink lg:order-1 lg:col-span-3">
          {meta.map(([label, value]) => (
            <div key={label} className="hairline grid grid-cols-[88px_1fr] gap-2 border-b py-2">
              <dt className="t-label pt-[3px]">{label}</dt>
              <dd className="t-mono">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="order-1 col-span-12 lg:order-2 lg:col-span-8 lg:col-start-5">
          <Statement {...intro} />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#work" className="btn">
              See the work <span aria-hidden="true">↓</span>
            </a>
            <a href="#contact" className="link-arrow">
              Write to me <span aria-hidden="true">→</span>
            </a>
            <a href={identity.cvUrl} target="_blank" rel="noreferrer" className="link-arrow">
              CV (PDF) <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
