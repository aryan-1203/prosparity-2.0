import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormTabs } from "@/components/form-tabs";
import { LeadForm } from "@/components/forms/lead-form";
import { RecoveryChart } from "@/components/home/recovery-chart";
import { backers, lendingLogos, lendingNames } from "@/components/home/logos";
import { Blocks, Intro, LinkOut, type Block } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "partners", "/partners");
}

export default async function PartnersPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.partners");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <Blocks blocks={t.raw("blocks") as Block[]} />
      <section className="band-mint">
        <div className="section container-site grid-site gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <h2 className="t-title text-teal-text">{t("battronTitle")}</h2>
            <p className="t-lead mt-4">{t("battronText")}</p>
            <LinkOut href="https://battron.in" className="text-link mt-2">{t("battronLink")}</LinkOut>
          </div>
          <div className="col-span-4 rounded-panel bg-white p-6 md:col-span-8 lg:col-span-5 lg:col-start-8"><RecoveryChart /></div>
        </div>
      </section>
      <section className="band-white">
        <div className="section container-site">
          <h2 className="t-heading text-forest">{t("lendersTitle")}</h2>
          <p className="mt-2 text-slate">{t("lendersText")}</p>
          <ul className="mt-6 grid grid-cols-2 border-l border-t border-hairline md:grid-cols-3 lg:grid-cols-5">
            {lendingLogos.map((logo) => (
              <li key={logo.name} className="flex h-24 items-center justify-center border-b border-r border-hairline p-5">
                <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} unoptimized={logo.src.endsWith(".svg")} className="max-h-11 w-auto object-contain" />
              </li>
            ))}
            {lendingNames.map((name) => <li key={name} className="flex h-24 items-center justify-center border-b border-r border-hairline p-5 text-center font-[540] text-forest">{name}</li>)}
          </ul>
          <h2 className="t-heading mt-12 text-forest">{t("backersTitle")}</h2>
          <ul className="mt-6 grid grid-cols-2 border-l border-t border-hairline md:grid-cols-3 lg:grid-cols-5">
            {backers.map((logo) => (
              <li key={logo.name} className="border-b border-r border-hairline">
                <a href={logo.href} rel="noopener" target="_blank" className="flex h-24 items-center justify-center p-5">
                  <Image src={logo.src} alt={logo.name} width={303} height={151} className="max-h-14 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="enquiry" className="section-tight band-sage scroll-mt-20">
        <div className="container-site grid-site gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <h2 className="t-title text-forest">{t("formTitle")}</h2>
            <p className="t-lead mt-4">{t("formText")}</p>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <FormTabs label={t("formTabs")} tabs={[
              { key: "dealer", label: t("tabDealer"), form: <LeadForm type="dealer" /> },
              { key: "lender", label: t("tabLender"), form: <LeadForm type="lender" /> },
              { key: "battery", label: t("tabBattery"), form: <LeadForm type="battery" /> },
            ]} />
          </div>
        </div>
      </section>
    </>
  );
}
