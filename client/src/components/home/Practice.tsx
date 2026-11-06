import type { PortfolioData } from "@shared/schema";
import { SheetHeader } from "../SheetHeader";
import { Reveal } from "../Reveal";

export function Practice({ data }: { data: PortfolioData["practice"] }) {
  const { portrait } = data;

  return (
    <section id="practice" aria-label="Practice" className="pb-[var(--sheet-gap)]">
      <SheetHeader sheet="practice" title="Practice" note="How I work, and where I learned it" />

      <div className="gutter grid-12 gap-y-10">
        <figure className="col-span-8 xs:col-span-6 md:col-span-3">
          <span className="plate portrait">
            <img
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              decoding="async"
            />
          </span>
          <figcaption className="t-mono mt-2 text-graphite">{portrait.caption}</figcaption>
        </figure>

        <div className="col-span-12 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-5">
          {data.paragraphs.map((paragraph, index) => (
            <p key={index} className={index === 0 ? "t-statement" : "t-lede mt-6 max-w-[34em]"}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="gutter mt-16 md:mt-24">
        <h3 className="t-label border-b border-ink pb-2">Working notes</h3>
        <ol className="grid md:grid-cols-2">
          {data.notes.map((note, index) => (
            <Reveal
              as="li"
              key={note.title}
              delay={index % 2 ? 80 : 0}
              className={`hairline border-b py-6 md:py-8 ${index % 2 ? "md:pl-8" : "md:border-r md:pr-8"}`}
            >
              <p className="t-mono text-pen">N.{index + 1}</p>
              <h4 className="t-head mt-3 text-[clamp(1.5rem,2.4vw,2.25rem)]">{note.title}</h4>
              <p className="t-body mt-3">{note.body}</p>
              <p className="t-label mt-4">{note.source}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
