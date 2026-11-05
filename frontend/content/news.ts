/** Newsroom feed. Newest first. Titles and text are in messages under `news.items`. */
export const categories = ["company", "insight", "regulation", "industry"] as const;
export type Category = (typeof categories)[number];

export interface NewsItem {
  id: string;
  category: Category;
  /** Month the event happened, as YYYY-MM. */
  date: string;
  /** Our own article, read at /news/<slug>. */
  slug?: string;
  /** Someone else's reporting. We summarise and link out. */
  source?: { name: string; url: string };
}

export const news: readonly NewsItem[] = [
  { id: "collections", category: "insight", date: "2026-11", slug: "ev-financing-gap-nach-mandate" },
  { id: "batteryRisk", category: "insight", date: "2026-11", slug: "why-the-battery-decides-credit-risk" },
  { id: "evSalesSept", category: "industry", date: "2026-10", source: { name: "EVreporter", url: "https://evreporter.com/indias-electric-vehicle-sales-trend-september-2026/" } },
  { id: "productsLive", category: "company", date: "2026-09" },
  { id: "e2wSubsidy", category: "industry", date: "2026-08", source: { name: "Autocar Professional", url: "https://www.autocarpro.in/news/govt-extends-pm-e-drive-subsidy-for-e2ws-till-fy28-increases-allocation-134036?amp=1" } },
  { id: "batteryLoans", category: "company", date: "2026-05" },
  { id: "battronLaunch", category: "company", date: "2026-04", slug: "battron-launches" },
  { id: "e3wShare", category: "industry", date: "2026-04", source: { name: "Autocar Professional", url: "https://www.autocarpro.in/analysis/ev-share-of-3-wheeler-sales-jumps-to-61-cng-falls-to-24-in-fy2026-131965?amp=1" } },
  { id: "nbfc", category: "company", date: "2026-02" },
  { id: "rbiDirections", category: "regulation", date: "2025-05", slug: "rbi-digital-lending-disclosure-norms" },
  { id: "preSeed", category: "company", date: "2024-05", source: { name: "The Assam Tribune", url: "https://assamtribune.com/business/fintech-platform-prosparity-raises-funds-from-beenext-other-investors-1536894" } },
];

export const articles = news.filter((item): item is NewsItem & { slug: string } => Boolean(item.slug));
