import type { Project } from "@shared/schema";
import { OrderTrace } from "./OrderTrace";
import { CanvasMini } from "./CanvasMini";
import { RoleLens } from "./RoleLens";
import { SafeBrowserFigure } from "./SafeBrowserFigure";
import { ExamBrowserFigure } from "./ExamBrowserFigure";

export function ProjectFigure({ kind }: { kind: NonNullable<Project["figure"]> }) {
  if (kind === "order-trace") return <OrderTrace />;
  if (kind === "canvas-mini") return <CanvasMini />;
  if (kind === "safe-browser") return <SafeBrowserFigure />;
  if (kind === "exam-browser") return <ExamBrowserFigure />;
  return <RoleLens />;
}
