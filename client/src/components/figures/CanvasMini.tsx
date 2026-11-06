import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Shape = {
  id: string;
  name: string;
  kind: "rect" | "circle" | "text";
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  fill: string;
  clip?: boolean;
  text?: string;
};

const STAGE = { w: 640, h: 420 };
const MIN_SIZE = 32;

/** Listed bottom to top, so array order is paint order. */
const INITIAL: Shape[] = [
  { id: "panel", name: "Panel", kind: "rect", x: 60, y: 56, w: 300, h: 300, opacity: 1, fill: "#14130F" },
  { id: "sun", name: "Circle", kind: "circle", x: 268, y: 130, w: 190, h: 190, opacity: 0.9, fill: "#1B2BD8" },
  { id: "bar", name: "Bar", kind: "rect", x: 300, y: 330, w: 268, h: 34, opacity: 1, fill: "#B9B4A6" },
  { id: "title", name: "Headline", kind: "text", x: 84, y: 76, w: 250, h: 72, opacity: 1, fill: "#ECE9E1", text: "Drag me" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function ShapeBody({ shape }: { shape: Shape }) {
  if (shape.kind === "circle") {
    return (
      <ellipse
        cx={shape.x + shape.w / 2}
        cy={shape.y + shape.h / 2}
        rx={shape.w / 2}
        ry={shape.h / 2}
        fill={shape.fill}
      />
    );
  }
  if (shape.kind === "text") {
    return (
      <text
        x={shape.x}
        y={shape.y + shape.h * 0.78}
        fill={shape.fill}
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight={800}
        fontSize={shape.h * 0.82}
        textLength={shape.w}
        lengthAdjust="spacingAndGlyphs"
      >
        {shape.text}
      </text>
    );
  }
  return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.fill} />;
}

type Gesture =
  | { type: "move"; id: string; dx: number; dy: number }
  | { type: "resize"; id: string; ox: number; oy: number };

export function CanvasMini() {
  const [shapes, setShapes] = useState<Shape[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>("title");
  const [history, setHistory] = useState<Shape[][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<Gesture | null>(null);

  const selected = shapes.find((shape) => shape.id === selectedId) ?? null;

  /** Saves the current state, so that a whole gesture undoes as one step. */
  const checkpoint = useCallback(() => {
    setHistory((past) => [...past.slice(-30), shapes]);
  }, [shapes]);

  const patch = (id: string, changes: Partial<Shape>) => {
    setShapes((current) => current.map((shape) => (shape.id === id ? { ...shape, ...changes } : shape)));
  };

  const undo = () => {
    setHistory((past) => {
      const previous = past[past.length - 1];
      if (previous) setShapes(previous);
      return past.slice(0, -1);
    });
  };

  /** Screen pixels to stage units, whatever size the SVG is displayed at. */
  const toStage = (event: PointerEvent) => {
    const matrix = svgRef.current!.getScreenCTM()!.inverse();
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  };

  const startMove = (event: PointerEvent, shape: Shape) => {
    event.preventDefault();
    setSelectedId(shape.id);
    checkpoint();
    const point = toStage(event);
    gesture.current = { type: "move", id: shape.id, dx: point.x - shape.x, dy: point.y - shape.y };
    svgRef.current!.setPointerCapture(event.pointerId);
  };

  const startResize = (event: PointerEvent, shape: Shape) => {
    event.preventDefault();
    event.stopPropagation();
    checkpoint();
    gesture.current = { type: "resize", id: shape.id, ox: shape.x, oy: shape.y };
    svgRef.current!.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    const active = gesture.current;
    if (!active) return;
    const point = toStage(event);
    if (active.type === "move") {
      patch(active.id, { x: Math.round(point.x - active.dx), y: Math.round(point.y - active.dy) });
    } else {
      patch(active.id, {
        w: Math.round(Math.max(MIN_SIZE, point.x - active.ox)),
        h: Math.round(Math.max(MIN_SIZE, point.y - active.oy)),
      });
    }
  };

  const endGesture = () => {
    gesture.current = null;
  };

  const onShapeKey = (event: KeyboardEvent, shape: Shape) => {
    const step = event.shiftKey ? 24 : 6;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      checkpoint();
      patch(shape.id, {
        x: clamp(shape.x + move[0], -shape.w + 8, STAGE.w - 8),
        y: clamp(shape.y + move[1], -shape.h + 8, STAGE.h - 8),
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedId(shape.id);
    }
  };

  const reorder = (id: string, direction: 1 | -1) => {
    checkpoint();
    setShapes((current) => {
      const from = current.findIndex((shape) => shape.id === id);
      const to = from + direction;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const toggleClip = () => {
    if (!selected) return;
    checkpoint();
    patch(selected.id, { clip: !selected.clip });
  };

  const serialize = () => {
    const clone = svgRef.current!.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-ui]").forEach((node) => node.remove());
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(STAGE.w));
    clone.setAttribute("height", String(STAGE.h));
    return new XMLSerializer().serializeToString(clone);
  };

  const download = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const exportSvg = () => {
    const url = URL.createObjectURL(new Blob([serialize()], { type: "image/svg+xml" }));
    download(url, "miniature.svg");
    URL.revokeObjectURL(url);
  };

  const exportPng = () => {
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = STAGE.w * scale;
      canvas.height = STAGE.h * scale;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "#F5F3ED";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      download(canvas.toDataURL("image/png"), "miniature.png");
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialize())}`;
  };

  return (
    <figure aria-label="Working miniature of a canvas design tool">
      <div className="grid border border-ink bg-vellum md:grid-cols-[1fr_216px]">
        {/* Stage */}
        <div className="min-w-0 border-b border-ink md:border-b-0 md:border-r">
          <div className="hairline flex items-center justify-between gap-3 border-b px-3 py-1.5">
            <button
              type="button"
              className="t-mono min-h-[36px] pr-2 underline underline-offset-2 hover:text-pen disabled:no-underline disabled:opacity-40"
              onClick={undo}
              disabled={history.length === 0}
            >
              Undo{history.length ? ` (${history.length})` : ""}
            </button>
            <p className="t-mono truncate text-graphite" aria-live="off">
              {selected
                ? `${selected.name}  x ${selected.x}  y ${selected.y}  ${selected.w}×${selected.h}`
                : "Nothing selected"}
            </p>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
            className="block w-full select-none"
            style={{ touchAction: "pan-y" }}
            onPointerMove={onPointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
            onPointerDown={(event) => {
              if (event.target === svgRef.current) setSelectedId(null);
            }}
            role="group"
            aria-label="Canvas. Select a shape, then use the arrow keys to move it."
          >
            <defs>
              {/* Clipped layers are masked by a rounded window. */}
              {shapes
                .filter((shape) => shape.clip)
                .map((shape) => (
                  <clipPath key={shape.id} id={`clip-${shape.id}`}>
                    <path
                      d={`M ${shape.x} ${shape.y + shape.h} A ${shape.w / 2} ${shape.h / 1.6} 0 0 1 ${shape.x + shape.w} ${shape.y + shape.h} Z`}
                    />
                  </clipPath>
                ))}
            </defs>
            {shapes.map((shape) => (
              <g
                key={shape.id}
                opacity={shape.opacity}
                clipPath={shape.clip ? `url(#clip-${shape.id})` : undefined}
                onPointerDown={(event) => startMove(event, shape)}
                onKeyDown={(event) => onShapeKey(event, shape)}
                onFocus={() => setSelectedId(shape.id)}
                tabIndex={0}
                role="button"
                aria-label={`${shape.name}. Arrow keys move it.`}
                className="cursor-move outline-none"
                style={{ touchAction: "none" }}
              >
                <ShapeBody shape={shape} />
              </g>
            ))}
            {selected && (
              <g data-ui>
                <rect
                  x={selected.x}
                  y={selected.y}
                  width={selected.w}
                  height={selected.h}
                  fill="none"
                  stroke="#1B2BD8"
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
                <rect
                  x={selected.x + selected.w - 11}
                  y={selected.y + selected.h - 11}
                  width={22}
                  height={22}
                  fill="#F5F3ED"
                  stroke="#1B2BD8"
                  strokeWidth={1.5}
                  className="cursor-nwse-resize"
                  style={{ touchAction: "none" }}
                  onPointerDown={(event) => startResize(event, selected)}
                  aria-hidden="true"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Inspector */}
        <div className="flex flex-col">
          <div className="hairline border-b p-3">
            <p className="t-label">Layers</p>
            <ul className="mt-2">
              {[...shapes].reverse().map((shape, index) => (
                <li key={shape.id} className="flex items-stretch gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(shape.id)}
                    aria-pressed={shape.id === selectedId}
                    className={`t-mono min-h-[36px] flex-1 px-2 text-left transition-colors ${
                      shape.id === selectedId ? "bg-pen text-paper" : "hover:bg-ink/10"
                    }`}
                  >
                    {shape.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${shape.name} forward`}
                    disabled={index === 0}
                    onClick={() => reorder(shape.id, 1)}
                    className="t-mono min-h-[36px] w-7 hover:text-pen disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${shape.name} back`}
                    disabled={index === shapes.length - 1}
                    onClick={() => reorder(shape.id, -1)}
                    className="t-mono min-h-[36px] w-7 hover:text-pen disabled:opacity-25"
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="hairline border-b p-3">
            <label className="t-label flex justify-between" htmlFor="opacity">
              <span>Opacity</span>
              <span>{selected ? `${Math.round(selected.opacity * 100)}%` : "–"}</span>
            </label>
            <input
              id="opacity"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              disabled={!selected}
              value={selected?.opacity ?? 1}
              onPointerDown={checkpoint}
              onChange={(event) => selected && patch(selected.id, { opacity: Number(event.target.value) })}
              className="mt-2 w-full accent-pen"
            />
            <label className="t-mono mt-3 flex min-h-[32px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="accent-pen"
                disabled={!selected}
                checked={Boolean(selected?.clip)}
                onChange={toggleClip}
              />
              Clip path
            </label>
          </div>

          <div className="p-3">
            <p className="t-label">Export</p>
            <div className="mt-2 flex gap-1">
              <button type="button" onClick={exportSvg} className="chip flex-1">
                SVG
              </button>
              <button type="button" onClick={exportPng} className="chip flex-1">
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="t-mono mt-3 text-graphite">
        Fig. B. It works: drag, resize from the corner, reorder layers, undo, export. Under 400 lines of React and SVG,
        written for this page. This is not Skye Editor.
      </figcaption>
    </figure>
  );
}
