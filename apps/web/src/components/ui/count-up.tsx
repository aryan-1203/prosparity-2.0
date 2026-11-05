"use client";

import { useEffect, useRef } from "react";

const DURATION = 500;
const easeOut = (x: number) => 1 - (1 - x) ** 3;

/** The final value is in the server HTML. Only an aria-hidden copy animates, once. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/\d[\d,]*(?:\.\d+)?/);
  const digits = match?.[0] ?? "";
  const start = match?.index ?? 0;
  const prefix = value.slice(0, start);
  const suffix = value.slice(start + digits.length);

  useEffect(() => {
    const el = ref.current;
    const target = Number(digits.replace(/,/g, ""));
    if (!el || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const decimals = digits.split(".")[1]?.length ?? 0;
    const format = new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const begin = performance.now();
      const tick = (now: number) => {
        const x = Math.min((now - begin) / DURATION, 1);
        el.textContent = format.format(target * easeOut(x));
        if (x < 1) frame = requestAnimationFrame(tick);
        else el.textContent = digits;
      };
      frame = requestAnimationFrame(tick);
    }, { rootMargin: "-10% 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [digits]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{prefix}<span ref={ref} className="tabular-nums">{digits}</span>{suffix}</span>
    </>
  );
}
