import type { PortfolioData, SkillTier } from "@shared/schema";
import { SheetHeader } from "../SheetHeader";

const TIERS: Record<SkillTier, { label: string; description: string }> = {
  daily: { label: "Daily", description: "What I reach for first" },
  regular: { label: "Regular", description: "Shipped real work with it" },
  familiar: { label: "Familiar", description: "Used it, still learning" },
};

function TierMark({ tier }: { tier: SkillTier }) {
  const style =
    tier === "daily"
      ? "bg-ink border-ink"
      : tier === "regular"
        ? "border-ink bg-[linear-gradient(90deg,rgb(var(--ink))_50%,transparent_50%)]"
        : "border-ink/60";
  return (
    <span
      aria-hidden="true"
      className={`mt-[0.38em] inline-block h-2.5 w-2.5 shrink-0 rounded-full border ${style}`}
    />
  );
}

export function Toolkit({ data }: { data: PortfolioData["toolkit"] }) {
  // Frontend is the core of the practice, so it gets the most room.
  const [lead, ...others] = data;

  const Group = ({ group, big = false }: { group: PortfolioData["toolkit"][number]; big?: boolean }) => (
    <div>
      <h3 className={`t-head border-b border-ink pb-2 ${big ? "text-[clamp(2rem,3.4vw,3.25rem)]" : "text-[clamp(1.5rem,2.2vw,2rem)]"}`}>
        {group.group}
      </h3>
      <ul>
        {group.items.map((item) => (
          <li key={item.name} className="hairline flex items-start gap-3 border-b py-2">
            <TierMark tier={item.tier} />
            <span className="sr-only">{TIERS[item.tier].label}: </span>
            <span className={`min-w-0 flex-1 leading-snug ${big ? "t-head text-[clamp(1.25rem,1.8vw,1.625rem)]" : "text-[1.125rem]"}`}>
              {item.name}
            </span>
            <span className="t-mono max-w-[48%] pt-[0.2em] text-right text-graphite">{item.where}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section id="toolkit" aria-label="Toolkit" className="pb-[var(--sheet-gap)]">
      <SheetHeader sheet="toolkit" title="Toolkit" note="With where each was used" />

      <div className="gutter">
        <dl className="mb-10 flex flex-wrap gap-x-8 gap-y-2">
          {(Object.keys(TIERS) as SkillTier[]).map((tier) => (
            <div key={tier} className="flex items-start gap-2">
              <TierMark tier={tier} />
              <div className="flex flex-wrap gap-x-2">
                <dt className="t-mono">{TIERS[tier].label}</dt>
                <dd className="t-mono text-graphite">{TIERS[tier].description}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="grid-12 gap-y-12">
          {lead && (
            <div className="col-span-12 lg:col-span-7">
              <Group group={lead} big />
            </div>
          )}
          <div className="col-span-12 flex flex-col gap-12 lg:col-span-4 lg:col-start-9">
            {others.map((group) => (
              <Group key={group.group} group={group} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
