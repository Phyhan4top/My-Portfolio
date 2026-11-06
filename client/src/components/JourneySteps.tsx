import type { Project } from "@shared/schema";
import { Reveal } from "./Reveal";
import { Plate } from "./Plate";

type Image = Project["images"][number];

function groupBySteps(images: Image[]) {
  const steps = new Map<string, Image[]>();
  for (const image of images) {
    if (image.step) steps.set(image.step, [...(steps.get(image.step) ?? []), image]);
  }
  return Array.from(steps);
}

/**
 * A user journey as numbered steps: the main screen on the left, a companion
 * screen in the margin. Phones lead with the phone-sized screen.
 */
export function JourneySteps({ images }: { images: Image[] }) {
  return (
    <ol>
      {groupBySteps(images).map(([step, [main, side]], index) => (
        <Reveal as="li" key={step} className="hairline border-b py-6 last:border-b-0 md:py-10">
          <p className="flex items-baseline gap-3">
            <span className="t-mono text-pen">{String(index + 1).padStart(2, "0")}</span>
            <span className="t-head text-[clamp(1.5rem,2.4vw,2.25rem)]">{step}</span>
          </p>
          <div className="grid-12 mt-4 gap-y-6">
            <Plate
              image={main}
              className={`${main.desktopOnly ? "hidden md:block" : ""} ${
                side ? "col-span-12 md:col-span-8" : "col-span-8 xs:col-span-6 md:col-span-3"
              }`}
            />
            {side && (
              <Plate
                image={side}
                className="col-span-8 xs:col-span-6 md:col-span-3 md:col-start-10"
              />
            )}
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
