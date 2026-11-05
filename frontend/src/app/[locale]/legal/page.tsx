import { getTranslations, setRequestLocale } from "next-intl/server";
import { IndexList, Intro } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

const SLUGS = ["privacy-policy", "terms-and-conditions", "grievance-redressal", "dlg-disclosure", "refund-and-cancellation-policy", "lending-partners", "nbfc-details", "fair-practices-code"] as const;

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "legal", "/legal");
}

export default async function LegalIndex({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.legal");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="container-site pb-(--section)">
        <IndexList rows={SLUGS.map((slug) => ({ name: t(`docs.${slug}.name`), text: t(`docs.${slug}.text`), href: `/legal/${slug}` }))} />
      </section>
    </>
  );
}
