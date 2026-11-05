import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/lead-form";
import { Blocks, Faq, Intro, LinkOut, NumberedPath, Placeholder, type Block, type Item } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "support", "/support");
}

export default async function SupportPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.support");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")}>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="#ticket" className="btn btn-primary">{t("ticketCta")}</a>
          <a href="mailto:help@prosparity.in" className="text-link">help@prosparity.in</a>
        </div>
      </Intro>
      <Blocks blocks={t.raw("blocks") as Block[]} />
      <section className="band-white">
        <div className="section container-site grid-site gap-y-8">
          <h2 className="t-heading col-span-4 text-forest md:col-span-8 lg:col-span-4">{t("faqTitle")}</h2>
          <div className="col-span-4 md:col-span-8"><Faq items={t.raw("faq") as { q: string; a: string }[]} /></div>
        </div>
      </section>
      <section id="ticket" className="section-tight band-sage scroll-mt-20">
        <div className="container-site grid-site gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <h2 className="t-title text-forest">{t("ticketTitle")}</h2>
            <p className="t-lead mt-3">{t("ticketText")}</p>
            <div className="mt-6"><p className="t-small mb-2 text-slate">{t("officeLabel")}</p><Placeholder>{t("officePlaceholder")}</Placeholder></div>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"><LeadForm type="contact" /></div>
        </div>
      </section>
      <section className="band-white">
        <div className="section container-site grid-site gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <h2 className="t-heading text-forest">{t("grievanceTitle")}</h2>
            <p className="mt-3 text-slate">{t("grievanceText")}</p>
            <Link href="/legal/grievance-redressal" prefetch={false} className="text-link mt-2">{t("grievanceLink")}</Link>
          </div>
          <div className="col-span-4 md:col-span-8">
            <NumberedPath steps={t.raw("grievanceSteps") as Item[]} />
            <LinkOut href="https://cms.rbi.org.in/cms/indexpage.html#eng" className="text-link mt-4">{t("rbiLink")}</LinkOut>
          </div>
        </div>
      </section>
    </>
  );
}
