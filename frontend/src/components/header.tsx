import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HeaderShell } from "./header-shell";
import { IconTile } from "./ui/icon";

export const productSlugs = ["electric-2-wheeler", "electric-3-wheeler", "l5-cargo", "dealer-financing"] as const;

export async function Header() {
  const t = await getTranslations("nav");
  const p = await getTranslations("products");
  const locale = (await getLocale()) as Locale;
  const groups = [
    {
      label: t("products"),
      items: productSlugs.map((slug, i) => ({ href: `/products/${slug}`, label: p(`${slug}.name`), note: p(`${slug}.nav`), icon: <IconTile name={["Zap", "Users", "Truck", "Store"][i] ?? "Zap"} /> })),
      all: { href: "/products", label: t("allProducts") },
    },
    {
      label: t("platform"),
      items: [
        { href: "/how-it-works", label: t("howItWorks"), note: t("howItWorksNote"), icon: <IconTile name="Route" /> },
        { href: "/technology", label: t("technology"), note: t("technologyNote"), icon: <IconTile name="Cpu" /> },
        { href: "/network", label: t("network"), note: t("networkNote"), icon: <IconTile name="MapPin" /> },
        { href: "/impact", label: t("impact"), note: t("impactNote"), icon: <IconTile name="Leaf" /> },
      ],
    },
    {
      label: t("company"),
      items: [
        { href: "/about", label: t("about"), note: t("aboutNote"), icon: <IconTile name="Building2" /> },
        { href: "/team", label: t("team"), note: t("teamNote"), icon: <IconTile name="Users" /> },
        { href: "/partners", label: t("partners"), note: t("partnersNote"), icon: <IconTile name="Handshake" /> },
        { href: "/news", label: t("newsroom"), note: t("newsroomNote"), icon: <IconTile name="Newspaper" /> },
        { href: "/careers", label: t("careers"), note: t("careersNote"), icon: <IconTile name="Sprout" /> },
      ],
    },
  ];
  return (
    <HeaderShell
      groups={groups}
      support={{ href: "/support", label: t("support") }}
      battron={{ href: "https://battron.in", label: "Battron", aria: t("battronAria") }}
      locale={locale}
      labels={{ callback: t("callback"), menu: t("menu"), close: t("close"), primary: t("primary"), home: t("home"), language: t("language") }}
    />
  );
}
