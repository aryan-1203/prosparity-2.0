import { getTranslations } from "next-intl/server";
import { createElement } from "react";
import { Icon } from "@/components/ui/icon";
import type { FeedItem } from "@/components/news-feed";
import { news, type NewsItem } from "@content/news";

const CATEGORY_ICONS = { company: "Building2", insight: "Lightbulb", regulation: "Scale", industry: "Newspaper" } as const;

export function formatMonth(month: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${month}-15`));
}

export async function feedItems(locale: string, list: readonly NewsItem[] = news): Promise<FeedItem[]> {
  const t = await getTranslations({ locale, namespace: "news" });
  return list.map((item) => ({
    id: item.id,
    icon: createElement(Icon, { name: CATEGORY_ICONS[item.category], className: "size-4 text-forest" }),
    category: item.category,
    categoryLabel: t(`categories.${item.category}`),
    date: formatMonth(item.date, locale),
    title: t(`items.${item.id}.title`),
    summary: t(`items.${item.id}.summary`),
    href: item.slug ? `/news/${item.slug}` : undefined,
    url: item.source?.url,
    sourceLabel: item.source ? t("via", { source: item.source.name }) : undefined,
  }));
}
