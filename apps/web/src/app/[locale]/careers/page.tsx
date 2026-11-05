import { getTranslations, setRequestLocale } from "next-intl/server";
import { Intro } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "careers", "/careers");
}

export default async function CareersPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.careers");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="container-site pb-(--section)">
        <div className="border-t border-hairline pt-6">
          <h2 className="t-subhead text-forest">{t("rolesTitle")}</h2>
          <p className="t-body mt-2">{t("empty")} <a href="mailto:hello@prosparity.in" className="text-forest underline underline-offset-4">hello@prosparity.in</a></p>
        </div>
      </section>
    </>
  );
}
