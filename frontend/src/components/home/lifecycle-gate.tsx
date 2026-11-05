"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const LifecycleMotion = dynamic(() => import("./lifecycle-motion"), { ssr: false });

const QUERY = "(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Phones and reduced-motion visitors never download the sequence. */
export function LifecycleGate() {
  const sticky = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  return sticky ? <LifecycleMotion /> : null;
}
