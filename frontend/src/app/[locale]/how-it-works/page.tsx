import { getTranslations, setRequestLocale } from "next-intl/server";
import { Blocks, Cta, Intro, type Block } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "howItWorks", "/how-it-works");
}

export default async function Page({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.howItWorks");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <Blocks blocks={t.raw("blocks") as Block[]} />
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/apply" secondary={t("ctaSecondary")} secondaryHref="/technology" />
    </>
  );
}
