import { getTranslations, setRequestLocale } from "next-intl/server";
import { IndiaMap } from "@/components/map/india-map";
import { Blocks, Cta, FigureList, Intro, LinkOut, type Block } from "@/components/sections";
import { MetricValue } from "@/components/ui/metric";
import { formatDate } from "@/lib/format";
import { pageMeta, type PageParams } from "@/lib/meta";
import { metrics } from "@content/metrics";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "network", "/network");
}

export default async function NetworkPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.network");
  const m = await getTranslations("metrics");
  const s = await getTranslations("sources");
  const home = await getTranslations("home.proof");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="on-dark bg-deep text-white">
        <div className="section-tight container-site">
          <FigureList ids={[{ id: "cities" }, { id: "dealers" }, { id: "states" }, { id: "lendingPartners" }]} />
          <p className="t-small mt-4 text-mint">{home("asOf", { date: formatDate(metrics.aum.asOf, locale), source: s("company") })}</p>
        </div>
      </section>
      <section className="band-white">
        <div className="section container-site">
          <h2 className="t-title text-forest">{t("mapTitle")}</h2>
          <div className="mt-6"><IndiaMap /></div>
        </div>
      </section>
      <Blocks blocks={t.raw("blocks") as Block[]} first="leaf" />
      <section className="band-mint">
        <div className="section-tight container-site grid-site items-center gap-y-6">
          <p className="t-display col-span-4 m-0 text-forest lg:col-span-3"><MetricValue id="e3wElectricShare" /></p>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
            <p className="t-lead">{m("e3wElectricShare")}</p>
            <LinkOut href="https://www.autocarpro.in/analysis/ev-share-of-3-wheeler-sales-jumps-to-61-cng-falls-to-24-in-fy2026-131965?amp=1" className="t-small mt-2 inline-flex items-center text-forest underline underline-offset-4">{s("autocarFy26")}</LinkOut>
          </div>
        </div>
      </section>
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/partners#enquiry" secondary={t("ctaSecondary")} secondaryHref="/products" />
    </>
  );
}
