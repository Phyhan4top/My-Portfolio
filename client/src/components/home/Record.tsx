import type { PortfolioData } from "@shared/schema";
import { currentMonthIndex, formatDuration, formatMonth, monthIndex } from "@/lib/dates";
import { SheetHeader } from "../SheetHeader";
import { SiteLink } from "../SiteLink";
import { Reveal } from "../Reveal";

/** A timeline drawn to scale, from the dates alone: overlaps and lengths are real. */
function RunChart({ roles }: { roles: PortfolioData["record"]["roles"] }) {
  const now = currentMonthIndex();
  const start = Math.min(...roles.map((role) => monthIndex(role.start)));
  const span = now - start + 1;
  const position = (month: number) => ((month - start) / span) * 100;

  const firstYear = Math.floor(start / 12) + 1;
  const lastYear = Math.floor(now / 12);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);

  return (
    <div
      className="relative mb-10 hidden pt-6 md:block"
      role="img"
      aria-label={`Timeline of ${roles.length} roles from ${formatMonth(roles[roles.length - 1].start)} to now, drawn to scale.`}
    >
      {years.map((year) => (
        <div key={year} className="absolute inset-y-0" style={{ left: `${position(year * 12)}%` }}>
          <span className="t-label absolute -top-0 left-1.5">{year}</span>
          <span className="block h-full w-px bg-[var(--rule)]" />
        </div>
      ))}
      <ul className="relative space-y-1">
        {[...roles].reverse().map((role) => {
          const from = monthIndex(role.start);
          const to = role.end ? monthIndex(role.end) : now;
          const current = !role.end;
          return (
            <li key={role.company} className="relative h-7">
              <div
                className={`t-mono absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap px-2 ${
                  current ? "bg-pen text-paper" : "bg-ink text-paper"
                }`}
                style={{ left: `${position(from)}%`, width: `${((to - from + 1) / span) * 100}%` }}
              >
                {role.company.split(" ")[0]}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Record({ data }: { data: PortfolioData["record"] }) {
  const now = currentMonthIndex();

  return (
    <section id="record" aria-label="Record" className="pb-[var(--sheet-gap)]">
      <SheetHeader sheet="record" title="Record" note="Drawn to scale, from the dates" />

      <div className="gutter">
        <RunChart roles={data.roles} />

        <ol className="border-t border-ink">
          {data.roles.map((role) => {
            const to = role.end ? monthIndex(role.end) : now;
            const months = to - monthIndex(role.start) + 1;
            return (
              <Reveal as="li" key={role.company} className="hairline grid-12 gap-y-3 border-b py-6 md:py-8">
                <div className="col-span-12 md:col-span-3">
                  <p className="t-mono">
                    {formatMonth(role.start)} – {role.end ? formatMonth(role.end) : "present"}
                  </p>
                  <p className="t-label mt-1">{formatDuration(months)}</p>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <h3 className="t-head text-[clamp(1.5rem,2.2vw,2rem)]">{role.role}</h3>
                  <p className="mt-1 text-[1.0625rem]">
                    {role.companyUrl ? (
                      <a href={role.companyUrl} target="_blank" rel="noreferrer" className="link-quiet">
                        {role.company} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      role.company
                    )}
                    <span className="text-graphite"> · {role.place}</span>
                  </p>
                  {role.projectSlug && (
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <SiteLink href={`/work/${role.projectSlug}`} className="link-quiet t-mono">
                        See the work →
                      </SiteLink>
                      {role.moreProjects?.map((project) => (
                        <SiteLink key={project.slug} href={`/work/${project.slug}`} className="link-quiet t-mono">
                          {project.label} →
                        </SiteLink>
                      ))}
                    </p>
                  )}
                </div>
                <ul className="col-span-12 space-y-2 md:col-span-5">
                  {role.points.map((point) => (
                    <li key={point} className="text-[1.0625rem] leading-snug">
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </ol>

        <div className="grid-12 gap-y-1 pt-6">
          <p className="t-mono col-span-12 md:col-span-3">{data.education.period}</p>
          <p className="col-span-12 text-[1.0625rem] md:col-span-9">
            <span className="t-head">{data.education.degree}</span>, {data.education.school}
            <span className="text-graphite"> · {data.education.place}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
