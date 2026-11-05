import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/lead-form";
import { Placeholder } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "contact", "/contact");
}

export default async function ContactPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.contact");
  return (
    <section className="container-site grid-site gap-y-10 pb-(--section) pt-[clamp(40px,8vh,96px)]">
      <div className="col-span-4 md:col-span-8 lg:col-span-5">
        <h1 className="t-display text-forest">{t("title")}</h1>
        <p className="t-lead mt-6">{t("lead")}</p>
        <dl className="mt-10">
          <div className="border-t border-hairline py-4">
            <dt className="t-small text-slate">{t("emailLabel")}</dt>
            <dd className="m-0"><a href="mailto:hello@prosparity.in" className="inline-flex min-h-11 items-center text-forest underline underline-offset-4">hello@prosparity.in</a></dd>
          </div>
          <div className="border-t border-hairline py-4">
            <dt className="t-small text-slate">{t("grievanceLabel")}</dt>
            <dd className="m-0"><Link href="/legal/grievance-redressal" className="inline-flex min-h-11 items-center text-forest underline underline-offset-4">{t("grievanceLink")}</Link></dd>
          </div>
          <div className="border-t border-b border-hairline py-4">
            <dt className="t-small mb-2 text-slate">{t("officeLabel")}</dt>
            <dd className="m-0"><Placeholder>{t("officePlaceholder")}</Placeholder></dd>
          </div>
        </dl>
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"><LeadForm type="contact" /></div>
    </section>
  );
}
