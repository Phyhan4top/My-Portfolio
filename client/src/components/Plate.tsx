import type { Project } from "@shared/schema";

type PlateProps = {
  image: Project["images"][number];
  className?: string;
  priority?: boolean;
};

/** A captioned image with reserved space, so the layout doesn't jump as it loads. */
export function Plate({ image, className = "", priority = false }: PlateProps) {
  return (
    <figure className={className}>
      <span className="plate">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
      <figcaption className="t-mono mt-2 text-graphite">{image.caption}</figcaption>
    </figure>
  );
}
