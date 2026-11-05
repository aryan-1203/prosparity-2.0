import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backers } from "@/components/home/logos";
import { founders } from "@/components/team";
import { FigureList, FormSplit, Intro } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { pageMeta, type PageParams } from "@/lib/meta";
import { metrics } from "@content/metrics";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "investors", "/investors");
}

export default async function InvestorsPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.investors");
  const team = await getTranslations("team");
  const home = await getTranslations("home.proof");
  const s = await getTranslations("sources");
  return (
    <>
      <Intro wide title={t("title")} lead={t("lead")} />
      <section className="container-site grid-site pb-(--section-tight)">
        <div className="col-span-4 space-y-5 md:col-span-8 lg:col-span-7 lg:col-start-5">
          {(t.raw("story") as string[]).map((p) => <p key={p} className="t-body">{p}</p>)}
        </div>
      </section>
      <section className="on-dark bg-deep text-white">
        <div className="section container-site">
          <h2 className="t-title">{t("tractionTitle")}</h2>
          <div className="mt-10">
            <FigureList ids={[{ id: "disbursed" }, { id: "loans" }, { id: "aum" }, { id: "dealers" }, { id: "cities" }, { id: "lendingPartners" }]} />
          </div>
          <p className="t-small mt-6 text-mint">{home("asOf", { date: formatDate(metrics.aum.asOf, locale), source: s("company") })}</p>
        </div>
      </section>
      <section className="band-white"><div className="section container-site">
        <h2 className="t-heading text-forest">{t("backersTitle")}</h2>
        <ul className="mt-6 grid grid-cols-2 border-l border-t border-hairline md:grid-cols-3 lg:grid-cols-5">
          {backers.map((logo) => (
            <li key={logo.name} className="border-b border-r border-hairline">
              <a href={logo.href} rel="noopener" target="_blank" className="flex h-28 items-center justify-center p-6">
                <Image src={logo.src} alt={logo.name} width={303} height={151} className="max-h-16 w-auto object-contain" />
              </a>
            </li>
          ))}
        </ul>
      </div></section>
      <section className="section container-site">
        <h2 className="t-heading text-forest">{t("leadersTitle")}</h2>
        <ul className="mt-6">
          {founders.slice(0, 2).map((p) => (
            <li key={p.id} className="flex items-center gap-5 border-t border-hairline py-5 last:border-b">
              {p.photo && <Image src={p.photo} alt="" width={96} height={96} className="size-20 rounded-full bg-sage object-cover" />}
              <div>
                <p className="t-subhead text-forest">{p.name}</p>
                <p className="text-slate">{team(`${p.id}.role`)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/team" className="text-link mt-4">{t("leadersLink")}</Link>
      </section>
      <FormSplit title={t("formTitle")} text={t("formText")} type="investor" />
    </>
  );
}
