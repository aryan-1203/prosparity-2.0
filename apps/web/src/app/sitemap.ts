import type { MetadataRoute } from "next";
import { productSlugs } from "@/components/header";
import { routing } from "@/i18n/routing";
import { articles } from "@content/news";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PATHS = ["", "/products", ...productSlugs.map((s) => `/products/${s}`), "/apply", "/how-it-works", "/technology", "/network", "/impact", "/about", "/team", "/partners", "/news", ...articles.map((a) => `/news/${a.slug}`), "/careers", "/investors", "/support", "/legal", "/legal/privacy-policy", "/legal/terms-and-conditions", "/legal/grievance-redressal", "/legal/dlg-disclosure", "/legal/refund-and-cancellation-policy", "/legal/lending-partners", "/legal/nbfc-details", "/legal/fair-practices-code"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE}/${locale}${path}`,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE}/${l}${path}`])) },
    })),
  );
}
