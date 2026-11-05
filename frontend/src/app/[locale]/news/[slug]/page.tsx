import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { NewsList } from "@/components/news-feed";
import { LinkOut } from "@/components/sections";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { feedItems, formatMonth } from "@/lib/news";
import { articles } from "@content/news";

type Params = { params: Promise<{ locale: string; slug: string }> };
type Reference = { label: string; url: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => articles.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: t(`items.${article.id}.title`),
    description: t(`items.${article.id}.summary`),
    alternates: { canonical: `/${locale}/news/${slug}`, languages: { en: `/en/news/${slug}`, hi: `/hi/news/${slug}` } },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { locale, slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const body = t.raw(`items.${article.id}.body`) as string[];
  const references = (t.has(`items.${article.id}.references`) ? t.raw(`items.${article.id}.references`) : []) as Reference[];
  const others = await feedItems(locale, articles.filter((a) => a.slug !== slug).slice(0, 2));
  return (
    <>
      <article className="band-white">
        <div className="container-site grid-site gap-y-6 py-[clamp(32px,6vh,72px)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            <Link href="/news" prefetch={false} className="text-link">{t("back")}</Link>
            <p className="t-small mt-3 text-slate"><span className="font-[520] text-forest">{t(`categories.${article.category}`)}</span>, {formatMonth(article.date, locale)}. {t("byline")}</p>
            <h1 className="t-title mt-2 text-forest">{t(`items.${article.id}.title`)}</h1>
            <p className="t-lead mt-4">{t(`items.${article.id}.summary`)}</p>
          </div>
          <div className="article t-body col-span-4 md:col-span-8 lg:col-span-7">
            {body.map((p) => <p key={p}>{p}</p>)}
            {references.length > 0 && (
              <div className="mt-8 border-t border-hairline pt-4">
                <h2 className="t-small font-[540] text-slate">{t("references")}</h2>
                <ul className="mt-2 space-y-1">
                  {references.map((r) => <li key={r.url}><LinkOut href={r.url} className="inline-flex items-center text-forest underline underline-offset-4">{r.label}</LinkOut></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
      <section className="band-leaf">
        <div className="section-tight container-site">
          <h2 className="t-heading text-forest">{t("keepReading")}</h2>
          <div className="mt-6"><NewsList wide items={others} readMore={t("readMore")} /></div>
        </div>
      </section>
    </>
  );
}
