import { getTranslations } from "next-intl/server";
import { EvDefs, inks } from "@/components/home/ev-art";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("pages.notFound");
  return (
    <section className="section container-site text-center">
      <EvDefs />
      <svg viewBox="0 30 640 340" className="mx-auto h-auto w-full max-w-sm" aria-hidden="true" focusable="false" style={inks.prosparity}>
        <path d="M0 357 H420 M500 357 H640" stroke="var(--color-forest)" strokeWidth="3" />
        <use href="#ev" transform="translate(-60 0)" />
      </svg>
      <h1 className="t-title mt-8 text-forest">{t("title")}</h1>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/" className="btn btn-primary">{t("home")}</Link>
        <Link href="/apply" className="text-link">{t("callback")}</Link>
      </div>
    </section>
  );
}
