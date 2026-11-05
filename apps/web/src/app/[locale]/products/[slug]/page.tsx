import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { EmiSection } from "@/components/emi-section";
import { productSlugs } from "@/components/header";
import { EvDefs } from "@/components/home/ev-art";
import { ProductArt } from "@/components/products/art";
import { Blocks, Cta, IndexList, Intro, type Block, type Item } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Params = { params: Promise<{ locale: string; slug: string }> };
const isProduct = (slug: string) => (productSlugs as readonly string[]).includes(slug);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => productSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = await params;
  if (!isProduct(slug)) return {};
  const t = await getTranslations({ locale, namespace: "products" });
  return {
    title: t(`${slug}.name`),
    description: t(`${slug}.lead`),
    alternates: { canonical: `/${locale}/products/${slug}`, languages: { en: `/en/products/${slug}`, hi: `/hi/products/${slug}` } },
  };
}

export default async function ProductPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isProduct(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const l = await getTranslations("pages.productLabels");
  const dealer = slug === "dealer-financing";
  const apply = dealer ? "/partners#enquiry" : `/apply?product=${slug}`;
  const blocks: Block[] = [
    { type: "prose", title: l("overview"), paras: t.raw(`${slug}.about`) as string[] },
    { type: "rail", title: l("why"), items: t.raw(`${slug}.why`) as Item[] },
    { type: "grid", title: l("who"), items: t.raw(`${slug}.who`) as Item[] },
    { type: "steps", title: l("journey"), items: t.raw(`${slug}.journey`) as Item[] },
    { type: "grid", title: l("documents"), intro: l("documentsIntro"), items: t.raw(`${slug}.documents`) as Item[] },
  ];
  return (
    <>
      <EvDefs />
      <Intro title={t(`${slug}.name`)} lead={t(`${slug}.lead`)} aside={<div className="rounded-panel bg-mint p-6"><ProductArt slug={slug} /></div>}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href={apply} prefetch={false} className="btn btn-primary">{dealer ? l("dealerCta") : l("applyCta")}</Link>
          {!dealer && <a href="#emi" className="text-link">{l("emiCta")}</a>}
        </div>
      </Intro>
      <Blocks blocks={blocks} />
      {!dealer && <EmiSection />}
      <section className="band-white">
        <div className="section container-site">
          <h2 className="t-heading text-forest">{l("others")}</h2>
          <div className="mt-6">
            <IndexList rows={productSlugs.filter((s) => s !== slug).map((s) => ({ name: t(`${s}.name`), text: t(`${s}.nav`), href: `/products/${s}` }))} />
          </div>
        </div>
      </section>
      <Cta title={t(`${slug}.cta`)} primary={dealer ? l("dealerCta") : l("applyCta")} primaryHref={apply} secondary={l("allProducts")} secondaryHref="/products" />
    </>
  );
}
