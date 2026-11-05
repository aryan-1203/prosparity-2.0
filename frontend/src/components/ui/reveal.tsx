"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children?: ReactNode;
  className?: string;
  /** "rise" fades and lifts; "draw" scales a bar in from the left. */
  variant?: "rise" | "draw";
  delay?: number;
  style?: CSSProperties;
}

/** Runs once. The hidden state is set only after JS confirms the element is below the fold. */
export function Reveal({ children, className, variant = "rise", delay = 0, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const [pre, done] = variant === "draw" ? ["draw-pre", "draw-in"] : ["reveal-pre", "reveal-in"];
    el.classList.add(pre);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      el.classList.add(done);
      el.classList.remove(pre);
    }, { rootMargin: "0px 0px -10% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  return (
    <div ref={ref} className={className} style={{ ...style, ["--delay" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}
