import { getTranslations, setRequestLocale } from "next-intl/server";
import { EvDefs, inks } from "@/components/home/ev-art";
import { FormSplit, Intro, NumberedPath, Rail, RuledBlocks } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

type Item = { name: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "lending", "/lending");
}

export default async function LendingPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.lending");
  return (
    <>
      <EvDefs />
      <Intro
        wide
        title={t("title")}
        lead={t("lead")}
        aside={
          <svg viewBox="0 30 640 330" className="h-auto w-full max-w-md" aria-hidden="true" focusable="false" style={inks.prosparity}>
            <line x1="0" y1="357" x2="640" y2="357" stroke="var(--color-forest)" strokeWidth="3" />
            <use href="#ev" />
          </svg>
        }
      />
      <Rail title={t("productsTitle")} intro={t("productsIntro")}>
        <RuledBlocks items={t.raw("products") as Item[]} />
      </Rail>
      <Rail title={t("howTitle")}>
        <NumberedPath steps={t.raw("how") as Item[]} />
      </Rail>
      <section className="container-site pb-(--section)">
        <div className="grid-site gap-y-4 rounded-panel bg-mint p-8 lg:p-12">
          <h2 className="t-heading col-span-4 text-forest md:col-span-8 lg:col-span-5">{t("emiTitle")}</h2>
          <p className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">{t("emiText")}</p>
        </div>
      </section>
      <FormSplit id="callback" title={t("formTitle")} text={t("formText")} type="callback" />
    </>
  );
}
