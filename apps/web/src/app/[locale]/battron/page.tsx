import { getTranslations, setRequestLocale } from "next-intl/server";
import { RecoveryChart } from "@/components/home/recovery-chart";
import { GaugeCells } from "@/components/home/gauge";
import { FormSplit, IndexList, Intro, Rail, RuledBlocks } from "@/components/sections";
import { MetricValue } from "@/components/ui/metric";
import { pageMeta, type PageParams } from "@/lib/meta";

type Item = { name: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "battron", "/battron");
}

export default async function BattronPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.battron");
  const m = await getTranslations("metrics");
  return (
    <>
      <Intro
        title={t("title")}
        lead={t("lead")}
        ink="text-teal-text"
        aside={<div className="flex flex-wrap items-center gap-3"><GaugeCells filled={5} /><span className="t-small text-slate">{t("gauge")}</span></div>}
      />
      <Rail title={t("servicesTitle")} ink="text-teal-text">
        <RuledBlocks items={t.raw("services") as Item[]} ink="text-teal-text" />
      </Rail>
      <section className="on-dark bg-deep text-white">
        <div className="section container-site grid-site gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-6"><RecoveryChart onDark /></div>
          <dl className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
            <div className="flex flex-col gap-1 border-t border-hairline-dark py-6">
              <dt className="text-mint">{m("daysToResale")}</dt>
              <dd className="t-title order-first m-0 text-signal"><MetricValue id="daysToResale" animate /></dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-hairline-dark py-6">
              <dt className="text-mint">{t("buyersLabel")}</dt>
              <dd className="t-title order-first m-0 text-signal">{t("buyersValue")}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="section container-site grid-site gap-y-8">
        <h2 className="t-title col-span-4 text-teal-text md:col-span-8 lg:col-span-4">{t("forTitle")}</h2>
        <div className="col-span-4 md:col-span-8">
          <IndexList rows={[
            { name: t("forLenders"), text: t("forLendersText"), href: "/lending-partners" },
            { name: t("forMakers"), text: t("forMakersText"), href: "/battron#enquiry" },
            { name: t("forBuyers"), text: t("forBuyersText"), href: "/lending#callback" },
          ]} />
        </div>
      </section>
      <FormSplit battron title={t("formTitle")} text={t("formText")} type="battery" />
    </>
  );
}
