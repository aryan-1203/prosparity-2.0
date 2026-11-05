import { getTranslations, setRequestLocale } from "next-intl/server";
import { RecoveryChart } from "@/components/home/recovery-chart";
import { FormSplit, Intro, Rail, RuledBlocks } from "@/components/sections";
import { Reveal } from "@/components/ui/reveal";
import { pageMeta, type PageParams } from "@/lib/meta";

type Item = { name: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "lenders", "/lending-partners");
}

export default async function LendersPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.lenders");
  const flow = t.raw("flow") as string[];
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <Rail title={t("coTitle")} intro={t("coIntro")}>
        <ol aria-label={t("flowLabel")} className="mb-8 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {flow.map((node, i) => (
            <li key={node} className="contents">
              <span className={`rounded-control border px-4 py-3 text-center font-[520] ${i === 1 ? "border-forest bg-forest text-white" : "border-control text-forest"}`}>{node}</span>
              {i < flow.length - 1 && <span aria-hidden="true" className="mx-auto block h-6 w-px bg-forest md:h-px md:w-8" />}
            </li>
          ))}
        </ol>
        <RuledBlocks items={t.raw("co") as Item[]} />
      </Rail>
      <section className="section container-site grid-site gap-y-10">
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-5"><RecoveryChart /></Reveal>
        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
          <h2 className="t-title text-teal-text">{t("battronTitle")}</h2>
          <p className="t-lead mt-4">{t("battronText")}</p>
        </div>
      </section>
      <FormSplit title={t("formTitle")} text={t("formText")} type="lender" />
    </>
  );
}
