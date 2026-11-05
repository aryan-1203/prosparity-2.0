import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormSplit, Intro, NumberedPath, Rail, RuledBlocks } from "@/components/sections";
import { MetricValue } from "@/components/ui/metric";
import { Link } from "@/i18n/navigation";
import { pageMeta, type PageParams } from "@/lib/meta";

type Item = { name: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "dealers", "/dealers");
}

export default async function DealersPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.dealers");
  const m = await getTranslations("metrics");
  return (
    <>
      <Intro
        wide
        title={t("title")}
        lead={t("lead")}
        aside={
          <p className="border-t-2 border-forest pt-4">
            <span className="t-display block text-forest"><MetricValue id="dealers" /></span>
            <span className="text-slate">{m("dealers")}</span>
          </p>
        }
      />
      <Rail title={t("whyTitle")}>
        <RuledBlocks items={t.raw("why") as Item[]} />
      </Rail>
      <Rail title={t("stepsTitle")}>
        <NumberedPath steps={t.raw("steps") as Item[]} />
      </Rail>
      <section className="container-site pb-(--section)">
        <div className="grid-site">
          <div className="col-span-4 rounded-panel bg-battron-tint p-8 md:col-span-8 lg:col-span-8 lg:col-start-5 lg:p-12">
            <h2 className="t-heading text-teal-text">{t("battronTitle")}</h2>
            <p className="t-body mt-3">{t("battronText")}</p>
            <Link href="/battron" className="text-link mt-3">{t("battronLink")}</Link>
          </div>
        </div>
      </section>
      <FormSplit title={t("formTitle")} text={t("formText")} type="dealer" />
    </>
  );
}
