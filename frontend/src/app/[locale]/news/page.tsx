import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/lead-form";
import { NewsFeed } from "@/components/news-feed";
import { Intro } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";
import { feedItems } from "@/lib/news";
import { categories } from "@content/news";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "news", "/news");
}

export default async function NewsPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.news");
  const n = await getTranslations("news");
  const items = await feedItems(locale);
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="band-white">
        <div className="section container-site">
          <h2 className="sr-only">{t("listTitle")}</h2>
          <NewsFeed
            items={items}
            label={t("filterLabel")}
            readMore={n("readMore")}
            filters={[{ key: "all", label: n("categories.all") }, ...categories.map((key) => ({ key, label: n(`categories.${key}`) }))]}
          />
        </div>
      </section>
      <section className="band-sage">
        <div className="section-tight container-site grid-site gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <h2 className="t-title text-forest">{t("subscribeTitle")}</h2>
            <p className="t-lead mt-3">{t("subscribeText")}</p>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"><LeadForm type="newsletter" /></div>
        </div>
      </section>
      <section className="band-leaf">
        <div className="section-tight container-site">
          <h2 className="t-heading text-forest">{t("pressTitle")}</h2>
          <p className="mt-2">{t("pressText")} <a href="mailto:help@prosparity.in?subject=Press%20enquiry" className="text-forest underline underline-offset-4">help@prosparity.in</a></p>
        </div>
      </section>
    </>
  );
}
