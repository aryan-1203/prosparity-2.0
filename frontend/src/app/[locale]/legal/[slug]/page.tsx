import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const FILES = ["privacy-policy", "terms-and-conditions", "grievance-redressal", "dlg-disclosure", "refund-and-cancellation-policy"];
const GAPS = ["fair-practices-code", "nbfc-details", "lending-partners"];
const ALL = [...FILES, ...GAPS];

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ALL.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = await params;
  if (!ALL.includes(slug)) return {};
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return { title: t(`docs.${slug}.name`), description: t(`docs.${slug}.text`), alternates: { canonical: `/${locale}/legal/${slug}`, languages: { en: `/en/legal/${slug}`, hi: `/hi/legal/${slug}` } } };
}

export default async function LegalDocument({ params }: Params) {
  const { locale, slug } = await params;
  if (!ALL.includes(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("pages.legal");
  const body = FILES.includes(slug)
    ? await marked.parse(await readFile(path.join(process.cwd(), "content/legal", `${slug}.md`), "utf8"))
    : null;

  return (
    <div className="container-site grid-site gap-y-8 pb-(--section) pt-[clamp(40px,8vh,96px)]">
      <aside className="col-span-4 md:col-span-8 lg:col-span-4">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
          <Link href="/legal" className="text-link">{t("back")}</Link>
          <h1 className="t-title mt-2 text-forest">{t(`docs.${slug}.name`)}</h1>
        </div>
      </aside>
      <div className="col-span-4 md:col-span-8">
        {locale === "hi" && body && <p lang="hi" className="mb-6 rounded-tag bg-pale px-4 py-3">{t("englishOnly")}</p>}
        {body ? (
          <article lang="en" className="legal-prose" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <div className="space-y-5">
            {slug === "lending-partners" && (
              <>
                <p className="t-body">{t("partnersIntro")}</p>
                <ul lang="en" className="border-t border-hairline">
                  {["Vivriti Capital Limited", "DMI Finance", "Manba Finance", "Namdev Finvest"].map((name) => (
                    <li key={name} className="border-b border-hairline py-3">{name}</li>
                  ))}
                </ul>
              </>
            )}
            {slug === "nbfc-details" && <p className="t-body">{t("nbfcIntro")}</p>}
            <Placeholder>{t(`docs.${slug}.placeholder`)}</Placeholder>
          </div>
        )}
      </div>
    </div>
  );
}
