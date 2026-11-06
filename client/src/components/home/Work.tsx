import type { ReactNode } from "react";
import type { Project } from "@shared/schema";
import { SheetHeader } from "../SheetHeader";
import { SiteLink } from "../SiteLink";
import { Reveal } from "../Reveal";
import { Plate } from "../Plate";
import { JourneySteps } from "../JourneySteps";
import { OrderTrace } from "../figures/OrderTrace";
import { CanvasMini } from "../figures/CanvasMini";
import { RoleLens } from "../figures/RoleLens";
import { SafeBrowserFigure } from "../figures/SafeBrowserFigure";
import { ExamBrowserFigure } from "../figures/ExamBrowserFigure";

type SpreadProps = { project: Project; code: string };

function SpreadMeta({ project, code }: { project: Project; code: string }) {
  return (
    <dl className="border-t border-ink">
      {[
        ["Sheet", code],
        ["Role", project.role],
        ["When", project.period],
        ["Status", project.status],
      ].map(([label, value]) => (
        <div key={label} className="hairline grid grid-cols-[64px_1fr] gap-2 border-b py-2">
          <dt className="t-label pt-[3px]">{label}</dt>
          <dd className="t-mono">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReadSheet({ project }: { project: Project }) {
  return (
    <SiteLink href={`/work/${project.slug}`} className="link-arrow">
      Read the full sheet <span aria-hidden="true">→</span>
    </SiteLink>
  );
}

const ProjectName = ({ children, className = "" }: { children: string; className?: string }) => (
  <h3 className={`t-condensed text-[clamp(3.75rem,15.5vw,15rem)] ${className}`}>{children}</h3>
);

/** Spread one: the name runs wide, the trace runs full-bleed on dark. */
function PhyhanAgroSpread({ project, code }: SpreadProps) {
  // The buyer's journey leads; the home page shows one staff screen, the rest are on the full sheet.
  const audit = project.images.find((image) => image.src.includes("phyhanagro-audit-log"));
  const live = project.links[0];
  return (
    <article aria-labelledby="spread-phyhanagro">
      <div className="gutter">
        <Reveal>
          <div id="spread-phyhanagro">
            <ProjectName>{project.name}</ProjectName>
          </div>
        </Reveal>
        <div className="grid-12 mt-8 gap-y-8 md:mt-12">
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <SpreadMeta project={project} code={code} />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-7 lg:col-start-5">
            <p className="t-lede">{project.summary}</p>
            <p className="t-body mt-5">
              It’s the most demanding thing I’ve built. Every order touches several farms, real money and a third-party
              carrier, and each of those can fail independently. So the system had to be designed around failure, and
              the interface had to tell people the truth about it.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <ReadSheet project={project} />
              {live && (
                <a href={live.href} target="_blank" rel="noreferrer" className="link-arrow">
                  Open the {live.label.toLowerCase()} <span aria-hidden="true">↗</span>
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="gutter mt-10 md:mt-16">
        <h4 className="t-label border-b border-ink pb-2">What a buyer sees</h4>
        <JourneySteps images={project.images} />
      </div>

      <div className="mt-10 md:mt-16">
        <OrderTrace />
      </div>

      {audit && (
        <div className="gutter mt-10 md:mt-16">
          <h4 className="t-label border-b border-ink pb-2">What staff see</h4>
          <div className="grid-12 mt-4">
            <Plate image={audit} className="col-span-12 md:col-span-8 md:col-start-5" />
          </div>
        </div>
      )}
    </article>
  );
}

/** One of the Chronicles mobile apps: the behaviour takes the page, the text sits alongside. */
function BrowserSpread({ project, code, figure, flip = false }: SpreadProps & { figure: ReactNode; flip?: boolean }) {
  return (
    <article aria-labelledby={`spread-${project.slug}`} className="gutter">
      <Reveal>
        <div id={`spread-${project.slug}`}>
          <ProjectName className={flip ? "md:text-right" : ""}>{project.name}</ProjectName>
        </div>
      </Reveal>
      <div className="grid-12 mt-8 gap-y-8 md:mt-12">
        <div className={`col-span-12 lg:col-span-8 ${flip ? "" : "lg:order-2"}`}>{figure}</div>
        <div className={`col-span-12 flex flex-col gap-6 lg:col-span-4 ${flip ? "" : "lg:order-1"}`}>
          <p className="t-lede">{project.summary}</p>
          <SpreadMeta project={project} code={code} />
          <p>
            <ReadSheet project={project} />
          </p>
        </div>
      </div>
    </article>
  );
}

/** Opens the mobile work: what ties the two apps together, and what they took. */
function MobileIntro() {
  return (
    <div className="gutter">
      <h3 className="t-label border-b border-ink pb-2">Mobile, at Chronicles</h3>
      <p className="t-statement mt-5 max-w-[30em]">
        Two React Native apps, built alone and running on the company’s student tablets, whose value is in what they
        stop people from doing.
      </p>
      <p className="t-body mt-5">
        Android builds on one of these kept failing with an error I couldn’t trace, and the developer communities had
        no matching solution. So I stopped chasing it, moved the source files into a clean project, and the builds
        passed.
      </p>
    </div>
  );
}

/** Spread two: right-aligned name; the tool itself takes the page. */
function SkyeSpread({ project, code }: SpreadProps) {
  return (
    <article aria-labelledby="spread-skye" className="gutter">
      <Reveal>
        <div id="spread-skye">
          <ProjectName className="md:text-right">{project.name}</ProjectName>
        </div>
      </Reveal>
      <div className="grid-12 mt-8 gap-y-8 md:mt-12">
        <div className="col-span-12 lg:col-span-8">
          <CanvasMini />
        </div>
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <p className="t-lede">{project.summary}</p>
          <p className="t-body">Rather than describe that work, I rebuilt a small piece of it. Try the canvas.</p>
          <SpreadMeta project={project} code={code} />
          <p>
            <ReadSheet project={project} />
          </p>
        </div>
      </div>
    </article>
  );
}

/** Spread three: text first, then the lens, with the live site beneath it. */
function ChroniclesSpread({ project, code }: SpreadProps) {
  const [site] = project.images;
  return (
    <article aria-labelledby="spread-chronicles" className="gutter">
      <Reveal>
        <div id="spread-chronicles">
          <h3 className="t-condensed text-[clamp(3.25rem,10.5vw,10rem)]">{project.name}</h3>
        </div>
      </Reveal>
      <div className="grid-12 mt-8 gap-y-8 md:mt-12">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <p className="t-lede">{project.summary}</p>
          <div className="mt-6">
            <SpreadMeta project={project} code={code} />
          </div>
          <p className="mt-6">
            <ReadSheet project={project} />
          </p>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
          <RoleLens />
          {site && <Plate image={site} className="mt-8 md:mt-12" />}
        </div>
      </div>
    </article>
  );
}

function Drawer({ projects, codeOf }: { projects: Project[]; codeOf: (project: Project) => string }) {
  return (
    <div className="gutter">
      <h3 className="t-label border-b border-ink pb-2">Also in the drawer</h3>
      <ul>
        {projects.map((project) => (
          <li key={project.slug} className="hairline border-b">
            <SiteLink
              href={`/work/${project.slug}`}
              className="group grid-12 items-baseline gap-y-1 py-4 transition-[padding,color] duration-300 hover:text-pen md:py-5 md:hover:pl-3"
            >
              <span className="t-mono col-span-2 text-graphite group-hover:text-pen md:col-span-1">
                {codeOf(project)}
              </span>
              <span className="t-head col-span-10 text-3xl md:col-span-3 md:text-4xl">{project.name}</span>
              <span className="col-span-10 col-start-3 text-[1.0625rem] leading-snug md:col-span-5 md:col-start-5">
                {project.summary}
              </span>
              <span className="t-mono col-span-10 col-start-3 text-graphite group-hover:text-pen md:col-span-2 md:col-start-10">
                {project.period}
              </span>
              <span aria-hidden="true" className="col-span-1 hidden text-right text-xl md:block">
                →
              </span>
            </SiteLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Work({ projects }: { projects: Project[] }) {
  const bySlug = (slug: string) => projects.find((project) => project.slug === slug);
  const phyhanagro = bySlug("phyhanagro");
  const safeBrowser = bySlug("safe-browser");
  const examBrowser = bySlug("exam-browser");
  const skye = bySlug("skye-editor");
  const chronicles = bySlug("chronicles");
  const lead = new Set(["phyhanagro", "safe-browser", "exam-browser", "skye-editor", "chronicles"]);
  const rest = projects.filter((project) => !lead.has(project.slug));
  // Matches the sheet number on each project's own page.
  const codeOf = (project: Project) => `A-${String(projects.indexOf(project) + 1).padStart(2, "0")}`;

  return (
    <section id="work" aria-label="Work">
      <SheetHeader sheet="work" title="Work" note="Selected work, 2023–2026" />
      <div className="flex flex-col gap-[var(--sheet-gap)] pb-[var(--sheet-gap)]">
        {phyhanagro && <PhyhanAgroSpread project={phyhanagro} code={codeOf(phyhanagro)} />}
        {(safeBrowser || examBrowser) && <MobileIntro />}
        {safeBrowser && (
          <BrowserSpread project={safeBrowser} code={codeOf(safeBrowser)} figure={<SafeBrowserFigure />} />
        )}
        {examBrowser && (
          <BrowserSpread project={examBrowser} code={codeOf(examBrowser)} figure={<ExamBrowserFigure />} flip />
        )}
        {skye && <SkyeSpread project={skye} code={codeOf(skye)} />}
        {chronicles && <ChroniclesSpread project={chronicles} code={codeOf(chronicles)} />}
        {rest.length > 0 && <Drawer projects={rest} codeOf={codeOf} />}
      </div>
    </section>
  );
}
