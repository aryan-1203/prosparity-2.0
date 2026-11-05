"use client";

import { useState, type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";

const keyOf = (target: EventTarget) => (target as Element).closest?.("[data-state]")?.getAttribute("data-state") ?? null;

/** Only tracks which state is active. All drawing is server-rendered and CSS does the highlighting. */
export function MapController({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const over = (e: PointerEvent) => { if (e.pointerType === "mouse") setHovered(keyOf(e.target)); };
  const click = (e: MouseEvent) => { const key = keyOf(e.target); setPinned((p) => (key === p ? null : key)); };
  const focus = (e: FocusEvent) => setHovered(keyOf(e.target));
  return (
    <div className="india-map" data-active={hovered ?? pinned ?? undefined} onPointerOver={over} onPointerLeave={() => setHovered(null)} onClick={click} onFocus={focus} onBlur={() => setHovered(null)}>
      {children}
    </div>
  );
}
