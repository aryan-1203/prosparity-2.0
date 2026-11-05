import { Fragment } from "react";

/** Digit runs are tabular; ₹, punctuation and units stay proportional. */
export function Num({ value }: { value: string }) {
  return value.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={i} className="tabular-nums">{part}</span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
