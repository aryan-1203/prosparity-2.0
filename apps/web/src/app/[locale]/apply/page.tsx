import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/lead-form";
import { Blocks, type Block } from "@/components/sections";
import { Icon } from "@/components/ui/icon";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "apply", "/apply");
}

export default async function ApplyPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.apply");
  return (
    <>
      <section className="band-mint">
        <div className="container-site grid-site gap-y-10 py-[clamp(32px,6vh,72px)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <h1 className="t-display text-forest">{t("title")}</h1>
            <p className="t-lead mt-6">{t("lead")}</p>
            <ul className="mt-6 space-y-2">{(t.raw("points") as string[]).map((p) => <li key={p} className="flex items-center gap-3"><Icon name="Check" className="size-5 shrink-0 text-forest" />{p}</li>)}</ul>
          </div>
          <div id="callback" className="col-span-4 scroll-mt-24 rounded-panel bg-white p-6 md:col-span-8 lg:col-span-6 lg:col-start-7 lg:p-8">
            <h2 className="t-subhead mb-4 text-forest">{t("formTitle")}</h2>
            <LeadForm type="callback" />
          </div>
        </div>
      </section>
      <Blocks blocks={t.raw("blocks") as Block[]} />
    </>
  );
}
