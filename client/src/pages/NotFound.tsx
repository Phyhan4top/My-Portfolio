import { Masthead } from "@/components/Masthead";
import { SiteLink } from "@/components/SiteLink";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useSeo } from "@/hooks/use-seo";

export default function NotFound() {
  const { shortName } = usePortfolio().identity;

  useSeo({
    title: `Sheet not found: ${shortName}`,
    description: "This sheet isn't in the set.",
    path: window.location.pathname,
  });

  return (
    <>
      <Masthead />
      <main id="main" className="gutter flex min-h-[80vh] flex-col justify-center py-16">
        <p className="t-label">Sheet 404</p>
        <h1 className="t-condensed mt-4 text-[clamp(4rem,16vw,15rem)]">Not in the set.</h1>
        <p className="t-lede mt-6 max-w-[26em]">This sheet was never issued, or it moved. The rest are all still here.</p>
        <p className="mt-8">
          <SiteLink href="/" className="link-arrow">
            Back to sheet 01 <span aria-hidden="true">→</span>
          </SiteLink>
        </p>
      </main>
    </>
  );
}
