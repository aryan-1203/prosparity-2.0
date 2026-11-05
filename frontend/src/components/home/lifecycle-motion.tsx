"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

const ramp = (v: number, from: number, to: number) => Math.min(1, Math.max(0, (v - from) / (to - from)));
const CELL_WINDOWS = [[0, 0.06], [0.17, 0.23], [0.37, 0.43], [0.57, 0.63], [0.77, 0.83]] as const;
const STRIP_STEPS = [[0.17, 0.23], [0.37, 0.43], [0.57, 0.63], [0.77, 0.83]] as const;

interface Parts {
  strip: SVGGElement;
  firstProp: SVGGElement;
  teal: SVGElement;
  loop: SVGGElement;
  gauge: HTMLElement;
  cells: SVGElement[];
  gaugeCells: HTMLElement[];
  labels: HTMLElement[];
  steps: HTMLElement[];
}

function collect(root: HTMLElement): Parts | null {
  const one = <T extends Element>(name: string) => root.querySelector<T>(`[data-lc="${name}"]`);
  const strip = one<SVGGElement>("strip");
  const firstProp = one<SVGGElement>("first-prop");
  const teal = one<SVGElement>("teal");
  const loop = one<SVGGElement>("loop");
  const gauge = one<HTMLElement>("gauge");
  if (!strip || !firstProp || !teal || !loop || !gauge) return null;
  return {
    strip, firstProp, teal, loop, gauge,
    cells: [...root.querySelectorAll<SVGElement>(".lc-stage [data-lc-cell]")],
    gaugeCells: [...root.querySelectorAll<HTMLElement>(".lc-stage [data-lc-gauge]")],
    labels: [...root.querySelectorAll<HTMLElement>("[data-lc-label]")],
    steps: [...root.querySelectorAll<HTMLElement>("[data-stage]")],
  };
}

/** All DOM writes live here, outside React. Five of these change state; the rest are per-frame styles. */
function paint(el: Parts, v: number, last: { index: number }) {
  const shift = STRIP_STEPS.reduce((sum, [a, b]) => sum + ramp(v, a, b), 0);
  el.strip.style.transform = `translateX(${-960 * shift}px)`;
  el.firstProp.style.opacity = String(ramp(v, 0, 0.06));
  el.gauge.style.opacity = String(ramp(v, 0, 0.06));
  el.teal.style.opacity = String(ramp(v, 0.17, 0.23) - ramp(v, 0.77, 0.83));
  el.loop.style.opacity = String(ramp(v, 0.8, 0.86));
  CELL_WINDOWS.forEach(([a, b], i) => {
    const x = ramp(v, a, b);
    const cell = el.cells[i];
    const bar = el.gaugeCells[i];
    if (cell) cell.style.opacity = String(x);
    if (bar) bar.style.transform = `scaleX(${x})`;
  });

  const index = v <= 0 ? -1 : Math.min(4, Math.floor(v / 0.2));
  if (index === last.index) return;
  last.index = index;
  el.labels.forEach((label, i) => { label.style.opacity = i === index ? "1" : "0"; });
  el.steps.forEach((step, i) => {
    if (i === index) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
}

/** useScroll must see a non-null target.current on first render or Motion throws. */
function LifecycleScroll({ targetEl, parts }: { targetEl: HTMLElement; parts: Parts }) {
  const target = useRef(targetEl);
  const last = useRef({ index: -2 });
  target.current = targetEl;

  const { scrollYProgress: p } = useScroll({ target, offset: ["start center", "end center"] });

  useMotionValueEvent(p, "change", (v) => {
    paint(parts, v, last.current);
  });
  useLayoutEffect(() => {
    paint(parts, p.get(), last.current);
  }, [parts, p]);

  return null;
}

export default function LifecycleMotion() {
  const [bound, setBound] = useState<{ target: HTMLElement; parts: Parts } | null>(null);

  useLayoutEffect(() => {
    const root = document.getElementById("lifecycle");
    if (!root) return;
    const parts = collect(root);
    const target = root.querySelector<HTMLElement>("[data-lc-steps]");
    if (parts && target) setBound({ target, parts });
  }, []);

  if (!bound) return null;
  return <LifecycleScroll targetEl={bound.target} parts={bound.parts} />;
}
