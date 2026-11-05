import { cellColor } from "./ev-art";

/** Five cells of what is known about the battery. Not charge, and not health. */
export function GaugeCells({ filled = 0, hook = false }: { filled?: number; hook?: boolean }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="relative block h-3 w-7 overflow-hidden rounded-cell border border-control">
          <span
            data-lc-gauge={hook ? i : undefined}
            className="draw-origin absolute inset-0 block"
            style={{ background: cellColor(i), transform: i < filled ? "none" : "scaleX(0)" }}
          />
        </span>
      ))}
    </div>
  );
}
