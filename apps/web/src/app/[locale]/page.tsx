import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backers, lendingLogos, lendingNames } from "@/components/home/logos";
import { Lifecycle } from "@/components/home/lifecycle";
import { RecoveryChart } from "@/components/home/recovery-chart";
import { NewsList } from "@/components/news-feed";
import { IndiaMap } from "@/components/map/india-map";
import { ProductGrid } from "@/components/products/product-grid";
import { Cta, FigureList, IndexList, LinkOut } from "@/components/sections";
import { Icon, IconTile } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { feedItems } from "@/lib/news";
import { metrics } from "@content/metrics";
import { news } from "@content/news";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "ProsParity", url: SITE, logo: `${SITE}/logos/prosparity.svg`, email: "help@prosparity.in" },
    { "@type": "FinancialService", name: "ProsParity", url: SITE, areaServed: ["Uttar Pradesh", "Madhya Pradesh", "Chhattisgarh"] },
  ],
};

const CHAIN_ICONS = ["BatteryWarning", "Ban", "CalendarX", "Truck", "TrendingDown"];

function Points({ items }: { items: string[] }) {
  return <ul className="mt-4 space-y-1.5">{items.map((p) => <li key={p} className="border-t border-forest/15 pt-1.5">{p}</li>)}</ul>;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const s = await getTranslations("sources");
  const n = await getTranslations("news");
  const latest = await feedItems(locale, news.slice(0, 4));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Lifecycle />

      <section className="band-white">
        <div className="section container-site grid-site gap-y-10">
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-7">
            <h2 className="t-title text-forest">{t("problem.title")}</h2>
            <p className="t-lead mt-5">{t("problem.body")}</p>
          </Reveal>
          <Reveal className="col-span-4 rounded-panel bg-leaf p-6 md:col-span-8 lg:col-span-5" delay={50}><RecoveryChart /></Reveal>
          <div className="col-span-4 md:col-span-8 lg:col-span-12">
            <h3 className="t-subhead text-forest">{t("problem.chainTitle")}</h3>
            <ol className="mt-4 grid gap-x-(--gutter) gap-y-3 md:grid-cols-5">
              {(t.raw("problem.chain") as string[]).map((step, i) => (
                <li key={step} className="border-t-2 border-loss-text pt-3">
                  <span className="text-loss-text"><Icon name={CHAIN_ICONS[i] ?? "Ban"} className="size-7" /></span>
                  <p className="mt-2">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="band-mint">
        <div className="section container-site">
          <h2 className="t-title text-forest">{t("businesses.title")}</h2>
          <p className="t-lead mt-3">{t("businesses.intro")}</p>
          <div className="grid-site mt-8 gap-y-4">
            <Reveal className="col-span-4 rounded-panel bg-white p-8 md:col-span-8 lg:col-span-7 lg:p-10">
              <h3 className="t-title text-forest">{t("businesses.lending.name")}</h3>
              <p className="t-lead mt-3">{t("businesses.lending.text")}</p>
              <Points items={t.raw("businesses.lending.points") as string[]} />
              <Link href="/products" prefetch={false} className="text-link mt-3">{t("businesses.lending.link")}</Link>
            </Reveal>
            <Reveal className="col-span-4 rounded-panel bg-battron-tint p-8 md:col-span-8 lg:col-span-5 lg:mt-12 lg:p-10" delay={50}>
              <h3 className="t-title text-teal-text">{t("businesses.battron.name")}</h3>
              <p className="mt-3">{t("businesses.battron.text")}</p>
              <Points items={t.raw("businesses.battron.points") as string[]} />
              <LinkOut href="https://battron.in" className="text-link mt-3">{t("businesses.battron.link")}</LinkOut>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="band-white">
        <div className="section container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div>
              <h2 className="t-title text-forest">{t("products.title")}</h2>
              <p className="t-lead mt-3">{t("products.intro")}</p>
            </div>
            <Link href="/products" prefetch={false} className="text-link">{t("products.link")}</Link>
          </div>
          <div className="mt-8"><ProductGrid defs={false} /></div>
        </div>
      </section>

      <section className="band-leaf">
        <div className="section container-site">
          <h2 className="t-title max-w-4xl text-forest">{t("thesis.title")}</h2>
          <p className="t-lead mt-4 max-w-3xl!">{t("thesis.text")}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(["digital", "field"] as const).map((side) => (
              <div key={side} className="rounded-panel bg-white p-6 lg:p-8">
                <h3 className="t-subhead flex items-center gap-3 text-forest"><IconTile name={side === "digital" ? "Smartphone" : "Footprints"} />{t(`thesis.${side}`)}</h3>
                <Points items={t.raw(`thesis.${side}Points`) as string[]} />
              </div>
            ))}
          </div>
          <Link href="/how-it-works" prefetch={false} className="text-link mt-4">{t("thesis.link")}</Link>
        </div>
      </section>

      <section className="on-dark bg-deep text-white">
        <div className="section container-site">
          <h2 className="t-title">{t("proof.title")}</h2>
          <div className="mt-8">
            <FigureList ids={[{ id: "disbursed" }, { id: "loans" }, { id: "aum" }, { id: "dealers" }, { id: "cities", label: t("proof.citiesAcross", { states: metrics.states.value }) }, { id: "lendingPartners" }]} />
          </div>
          <p className="t-small mt-4 text-mint">{t("proof.asOf", { date: formatDate(metrics.aum.asOf, locale), source: s("company") })}</p>
        </div>
      </section>

      <section className="band-leaf">
        <div className="section container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <h2 className="t-title text-forest">{t("network.title")}</h2>
            <Link href="/network" prefetch={false} className="text-link">{t("network.link")}</Link>
          </div>
          <div className="mt-6"><IndiaMap /></div>
        </div>
      </section>

      <section className="band-white">
        <div className="section container-site grid-site gap-y-8">
          <h2 className="t-title col-span-4 text-forest md:col-span-8 lg:col-span-4">{t("paths.title")}</h2>
          <div className="col-span-4 md:col-span-8">
            <IndexList rows={[
              { name: t("paths.lenders.name"), text: t("paths.lenders.text"), href: "/partners", icon: "Landmark" },
              { name: t("paths.dealers.name"), text: t("paths.dealers.text"), href: "/products/dealer-financing", icon: "Store" },
              { name: t("paths.oems.name"), text: t("paths.oems.text"), href: "/partners", icon: "Factory" },
              { name: t("paths.riders.name"), text: t("paths.riders.text"), href: "/products", icon: "Users" },
            ]} />
          </div>
        </div>
      </section>

      <section className="band-mint">
        <div className="section container-site grid gap-4 md:grid-cols-2">
          <div className="rounded-panel bg-white p-8">
            <IconTile name="Cpu" className="mb-4" />
            <h2 className="t-heading text-forest">{t("more.techTitle")}</h2>
            <p className="mt-3">{t("more.techText")}</p>
            <Link href="/technology" prefetch={false} className="text-link mt-2">{t("more.techLink")}</Link>
          </div>
          <div className="rounded-panel bg-white p-8 md:mt-8">
            <IconTile name="Leaf" className="mb-4" />
            <h2 className="t-heading text-forest">{t("more.impactTitle")}</h2>
            <p className="mt-3">{t("more.impactText")}</p>
            <Link href="/impact" prefetch={false} className="text-link mt-2">{t("more.impactLink")}</Link>
          </div>
        </div>
      </section>

      <section className="band-white">
        <div className="section container-site grid-site gap-y-6">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <h2 className="t-title text-forest">{t("news.title")}</h2>
            <Link href="/news" prefetch={false} className="text-link mt-2">{t("news.link")}</Link>
          </div>
          <div className="col-span-4 md:col-span-8"><NewsList items={latest} readMore={n("readMore")} /></div>
        </div>
      </section>

      <section className="band-leaf">
        <div className="section-tight container-site">
          <h2 className="t-heading text-forest">{t("partners.title")}</h2>
          <h3 className="t-small mt-6 font-[520] text-slate">{t("partners.lenders")}</h3>
          <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {lendingLogos.map((logo) => (
              <li key={logo.name} className="flex h-24 items-center justify-center rounded-control bg-white p-5">
                <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} unoptimized={logo.src.endsWith(".svg")} className="max-h-11 w-auto object-contain" />
              </li>
            ))}
            {lendingNames.map((name) => <li key={name} className="flex h-24 items-center justify-center rounded-control bg-white p-5 text-center font-[540] text-forest">{name}</li>)}
          </ul>
          <h3 className="t-small mt-8 font-[520] text-slate">{t("partners.backers")}</h3>
          <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {backers.map((logo) => (
              <li key={logo.name} className="rounded-control bg-white">
                <a href={logo.href} rel="noopener" target="_blank" className="flex h-24 items-center justify-center p-5">
                  <Image src={logo.src} alt={logo.name} width={303} height={151} className="max-h-14 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta title={t("cta.title")} text={t("cta.text")} primary={t("cta.primary")} primaryHref="/apply" secondary={t("cta.secondary")} secondaryHref="/partners" />
    </>
  );
}
