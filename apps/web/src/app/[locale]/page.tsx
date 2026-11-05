import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backers, lendingLogos, lendingNames } from "@/components/home/logos";
import { Lifecycle } from "@/components/home/lifecycle";
import { RecoveryChart } from "@/components/home/recovery-chart";
import { MetricValue } from "@/components/ui/metric";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { metrics, type MetricId } from "@content/metrics";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "ProsParity", url: SITE, logo: `${SITE}/logos/prosparity.svg`, email: "hello@prosparity.in" },
    { "@type": "FinancialService", name: "ProsParity", url: SITE, areaServed: ["Uttar Pradesh", "Madhya Pradesh", "Chhattisgarh"] },
  ],
};

const PROOF: readonly MetricId[] = ["disbursed", "loans", "aum", "dealers", "cities", "lendingPartners"];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const m = await getTranslations("metrics");
  const s = await getTranslations("sources");
  const asOf = formatDate(metrics.aum.asOf, locale);

  const paths = [
    ["dealers", "/dealers"],
    ["investors", "/investors"],
    ["lenders", "/lending-partners"],
    ["borrowers", "/lending"],
  ] as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Lifecycle />

      <section className="section container-site grid-site gap-y-12">
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-7">
          <h2 className="t-title text-forest">{t("problem.title")}</h2>
          <p className="t-lead mt-6">{t("problem.body")}</p>
        </Reveal>
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-5 lg:self-end" delay={50}>
          <RecoveryChart />
        </Reveal>
      </section>

      <section className="container-site pb-(--section)">
        <h2 className="t-heading text-forest">{t("businesses.title")}</h2>
        <div className="grid-site mt-10 gap-y-4">
          <Reveal className="col-span-4 rounded-panel bg-mint p-8 md:col-span-8 lg:col-span-7 lg:p-12">
            <h3 className="t-title text-forest">{t("businesses.lending.name")}</h3>
            <p className="t-lead mt-4">{t("businesses.lending.text")}</p>
            <Link href="/lending" className="text-link mt-4">{t("businesses.lending.link")}</Link>
          </Reveal>
          <Reveal className="col-span-4 rounded-panel bg-battron-tint p-8 md:col-span-8 lg:col-span-5 lg:mt-24 lg:p-10" delay={50}>
            <h3 className="t-title text-teal-text">{t("businesses.battron.name")}</h3>
            <p className="mt-4">{t("businesses.battron.text")}</p>
            <Link href="/battron" className="text-link mt-4">{t("businesses.battron.link")}</Link>
          </Reveal>
        </div>
      </section>

      <section className="on-dark bg-deep text-white">
        <div className="section container-site">
          <h2 className="t-title">{t("proof.title")}</h2>
          <dl className="mt-10 grid md:grid-cols-2 md:gap-x-(--gutter) lg:mt-14">
            {PROOF.map((id, i) => (
              <Reveal key={id} delay={(i % 2) * 50} className="flex flex-col gap-1 border-t border-hairline-dark py-6">
                <dt className="text-mint">
                  {id === "cities" ? t("proof.citiesAcross", { states: metrics.states.value }) : m(id)}
                </dt>
                <dd className="t-title order-first m-0 text-signal"><MetricValue id={id} animate /></dd>
              </Reveal>
            ))}
          </dl>
          <p className="t-small mt-6 text-mint">{t("proof.asOf", { date: asOf, source: s("company") })}</p>
        </div>
      </section>

      <section className="section container-site grid-site gap-y-8">
        <h2 className="t-title col-span-4 text-forest md:col-span-8 lg:col-span-4">{t("paths.title")}</h2>
        <ul className="col-span-4 md:col-span-8">
          {paths.map(([key, href]) => (
            <li key={key} className="index-row md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-baseline">
              <Link href={href} className="row-name t-subhead text-forest">{t(`paths.${key}.name`)}</Link>
              <p className="text-slate">{t(`paths.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site pb-(--section)">
        <h2 className="t-heading text-forest">{t("partners.title")}</h2>
        <h3 className="t-small mt-8 font-[520] text-slate">{t("partners.lenders")}</h3>
        <ul className="mt-3 grid grid-cols-2 border-l border-t border-hairline md:grid-cols-3 lg:grid-cols-5">
          {lendingLogos.map((logo) => (
            <li key={logo.name} className="flex h-28 items-center justify-center border-b border-r border-hairline p-6">
              <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} unoptimized={logo.src.endsWith(".svg")} className="max-h-12 w-auto object-contain" />
            </li>
          ))}
          {lendingNames.map((name) => (
            <li key={name} className="flex h-28 items-center justify-center border-b border-r border-hairline p-6 text-center font-[540] text-forest">{name}</li>
          ))}
        </ul>
        <h3 className="t-small mt-10 font-[520] text-slate">{t("partners.backers")}</h3>
        <ul className="mt-3 grid grid-cols-2 border-l border-t border-hairline md:grid-cols-3 lg:grid-cols-5">
          {backers.map((logo) => (
            <li key={logo.name} className="border-b border-r border-hairline">
              <a href={logo.href} rel="noopener" target="_blank" className="flex h-28 items-center justify-center p-6">
                <Image src={logo.src} alt={logo.name} width={303} height={151} className="max-h-16 w-auto object-contain" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-pale">
        <div className="section-tight container-site grid-site items-end gap-y-8">
          <h2 className="t-title col-span-4 text-forest md:col-span-8">{t("cta.title")}</h2>
          <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
            <Link href="/dealers" className="btn btn-primary">{t("cta.primary")}</Link>
            <Link href="/lending#callback" className="text-link">{t("cta.secondary")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
