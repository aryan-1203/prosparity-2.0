import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmiSection } from "@/components/emi-section";
import { ProductGrid } from "@/components/products/product-grid";
import { Blocks, Cta, Intro, type Block } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "products", "/products");
}

export default async function ProductsPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.products");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="band-white">
        <div className="section container-site">
          <h2 className="t-heading text-forest">{t("listTitle")}</h2>
          <div className="mt-6"><ProductGrid /></div>
        </div>
      </section>
      <Blocks blocks={t.raw("blocks") as Block[]} first="leaf" />
      <EmiSection />
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/apply" secondary={t("ctaSecondary")} secondaryHref="/how-it-works" />
    </>
  );
}
