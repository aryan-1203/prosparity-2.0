import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export type PageParams = { params: Promise<{ locale: string }> };

export async function pageMeta(locale: string, key: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `pages.${key}` });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}${path}`, languages: { ...languages, "x-default": `/en${path}` } },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), type: "website", locale: locale === "hi" ? "hi_IN" : "en_IN" },
  };
}
