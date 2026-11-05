/**
 * Single source of truth for every number on the site.
 *
 * Only allowlisted figures live here. Figures awaiting sign-off or a public
 * source are listed in `heldMetrics` by id, with NO value, so a held number
 * can never reach a page, a bundle or this repository.
 * Labels are translated: see `metrics.<id>` in messages/*.json.
 */
export interface Metric {
  /** The figure as displayed, without its unit. */
  readonly value: string;
  /** Unit key under `units` in the message files. */
  readonly unit?: "cr" | "days" | "lakh";
  /** ISO date, month, or Indian fiscal year. */
  readonly asOf: string;
  /** Message key under `sources`. */
  readonly source: "company" | "managementEstimate" | "vahanFy26";
}

export const metrics = {
  disbursed: { value: "₹71.9", unit: "cr", asOf: "2026-09-30", source: "company" },
  loans: { value: "4,754", asOf: "2026-09-30", source: "company" },
  aum: { value: "₹50.2", unit: "cr", asOf: "2026-09-30", source: "company" },
  lendingPartners: { value: "6", asOf: "2026-09-30", source: "company" },
  dealers: { value: "203", asOf: "2026-09-30", source: "company" },
  cities: { value: "27", asOf: "2026-09-30", source: "company" },
  states: { value: "3", asOf: "2026-10", source: "company" },
  battronRecovery: { value: "65%", asOf: "2026-08-31", source: "company" },
  industryRecovery: { value: "20–25%", asOf: "2026-10", source: "managementEstimate" },
  daysToResale: { value: "34", unit: "days", asOf: "2026-08-31", source: "company" },
  e3wElectricShare: { value: "61%", asOf: "FY26", source: "vahanFy26" },
} as const satisfies Record<string, Metric>;

export type MetricId = keyof typeof metrics;

/** Held ids, for the open-items list. Values stay out of this repository. */
export const heldMetrics = [
  "battery-cost-share",
  "collection-efficiency",
  "gross-npa",
  "par-figures",
] as const;
