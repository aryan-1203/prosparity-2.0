import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HeaderShell } from "./header-shell";

export async function Header() {
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;
  const items = [
    { href: "/dealers", label: t("dealers") },
    { href: "/investors", label: t("investors") },
    { href: "/lending-partners", label: t("lenders") },
    { href: "/lending", label: t("lending") },
    { href: "/battron", label: t("battron") },
    { href: "/about", label: t("about") },
  ];
  return (
    <HeaderShell
      items={items}
      locale={locale}
      labels={{ callback: t("callback"), menu: t("menu"), close: t("close"), primary: t("primary"), home: t("home"), language: t("language") }}
    />
  );
}
