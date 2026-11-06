import { useParams } from "wouter";
import { Masthead } from "@/components/Masthead";
import { SiteLink } from "@/components/SiteLink";
import { Reveal } from "@/components/Reveal";
import { Plate } from "@/components/Plate";
import { JourneySteps } from "@/components/JourneySteps";
import { ProjectFigure } from "@/components/figures";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useSeo } from "@/hooks/use-seo";
import NotFound from "./NotFound";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, identity } = usePortfolio();
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];

  useSeo({
    title: project ? `${project.name}: work by Phyhan` : "Sheet not found: Phyhan",
    description: project?.summary ?? "This sheet isn't in the set.",
    path: `/work/${slug}`,
  });

  if (!project) return <NotFound />;

  const next = projects[(index + 1) % projects.length];
  const code = `A-${String(index + 1).padStart(2, "0")}`;
  const longName = project.name.length > 14;
  const journey = project.images.filter((image) => image.step);
  const otherImages = project.images.filter((image) => !image.step);

  return (
    <>
      <Masthead />
      <main id="main">
        <article>
          <header className="gutter pt-5">
            <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4">
              <SiteLink href="/#work" className="t-mono link-quiet">
                ← All work
              </SiteLink>
              <p className="t-label">Sheet {code}</p>
            </nav>

            <h1
              className={`t-condensed mt-10 md:mt-16 ${
                longName ? "text-[clamp(3.25rem,10.5vw,10rem)]" : "text-[clamp(3.75rem,15.5vw,15rem)]"
              }`}
            >
              {project.name}
            </h1>

            <div className="grid-12 mt-8 gap-y-8 md:mt-12">
              <dl className="col-span-12 border-t border-ink md:col-span-4">
                {[
                  ["Context", project.context],
                  ["Role", project.role],
                  ["When", project.period],
                  ["Status", project.status],
                ].map(([label, value]) => (
                  <div key={label} className="hairline grid grid-cols-[72px_1fr] gap-2 border-b py-2">
                    <dt className="t-label pt-[3px]">{label}</dt>
                    <dd className="t-mono">{value}</dd>
                  </div>
                ))}
                <div className="hairline grid grid-cols-[72px_1fr] gap-2 border-b py-2">
                  <dt className="t-label pt-[3px]">Stack</dt>
                  <dd className="t-mono">{project.stack.join(", ")}</dd>
                </div>
                {project.links.length > 0 && (
                  <div className="hairline grid grid-cols-[72px_1fr] gap-2 border-b py-2">
                    <dt className="t-label pt-[3px]">Links</dt>
                    <dd className="t-mono flex flex-col items-start gap-1">
                      {project.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="link-quiet">
                          {link.label} ↗
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="col-span-12 md:col-span-7 md:col-start-6">
                <p className="t-statement">{project.summary}</p>
                {project.note && <p className="t-body mt-6 text-graphite">{project.note}</p>}
              </div>
            </div>
          </header>

          {project.figure && (
            <div className={`mt-12 md:mt-20 ${project.figure === "order-trace" ? "" : "gutter"}`}>
              <ProjectFigure kind={project.figure} />
            </div>
          )}

          <section className="gutter grid-12 mt-16 gap-y-6 md:mt-24" aria-labelledby="contribution">
            <h2 id="contribution" className="t-head col-span-12 text-3xl md:col-span-4 md:text-4xl">
              What I did
            </h2>
            <ol className="col-span-12 border-t border-ink md:col-span-7 md:col-start-6">
              {project.contribution.map((item, itemIndex) => (
                <li key={item} className="hairline grid grid-cols-[32px_1fr] gap-2 border-b py-3">
                  <span className="t-mono pt-1 text-graphite">{itemIndex + 1}</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ol>
          </section>

          {journey.length > 0 && (
            <section className="gutter mt-16 md:mt-24" aria-labelledby="journey">
              <h2 id="journey" className="t-head border-b border-ink pb-3 text-3xl md:text-4xl">
                What a buyer sees
              </h2>
              <JourneySteps images={journey} />
            </section>
          )}

          {otherImages.length > 0 && (
            <div className="gutter grid-12 mt-16 gap-y-8 md:mt-24">
              {otherImages.map((image, imageIndex) => {
                const isTall = image.height > image.width;
                const span = isTall
                  ? "col-span-8 xs:col-span-6 md:col-span-3"
                  : otherImages.length === 1 || imageIndex === 0
                    ? "col-span-12 md:col-span-9"
                    : "col-span-12 md:col-span-6";
                return <Plate key={image.src} image={image} className={span} />;
              })}
            </div>
          )}

          <section className="gutter mt-16 md:mt-24" aria-labelledby="hard-parts">
            <h2 id="hard-parts" className="t-head border-b border-ink pb-3 text-3xl md:text-4xl">
              The hard parts
            </h2>
            <ol>
              {project.challenges.map((challenge, challengeIndex) => (
                <Reveal as="li" key={challenge.title} className="hairline grid-12 gap-y-2 border-b py-6 md:py-10">
                  <p className="t-mono col-span-12 text-pen md:col-span-1">
                    {String.fromCharCode(65 + challengeIndex)}
                  </p>
                  <h3 className="t-head col-span-12 text-[clamp(1.5rem,2.4vw,2.25rem)] md:col-span-4">
                    {challenge.title}
                  </h3>
                  <p className="t-body col-span-12 md:col-span-6 md:col-start-6">{challenge.body}</p>
                </Reveal>
              ))}
            </ol>
          </section>
        </article>

        <nav aria-label="Next project" className="mt-16 md:mt-24">
          <SiteLink
            href={`/work/${next.slug}`}
            className="group theme-dark gutter block py-10 transition-colors md:py-16"
          >
            <span className="t-label block">Next sheet</span>
            <span className="t-condensed mt-3 block text-[clamp(3rem,11vw,11rem)] transition-colors group-hover:text-pen">
              {next.name} <span aria-hidden="true">→</span>
            </span>
          </SiteLink>
        </nav>

        <footer className="theme-dark gutter hairline flex flex-wrap justify-between gap-x-6 gap-y-2 border-t py-5 pb-24 md:pb-5">
          <p className="t-mono text-graphite">{identity.fullName}</p>
          <p className="t-mono">
            <a href={`mailto:${identity.email}`} className="link-quiet">
              {identity.email}
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
