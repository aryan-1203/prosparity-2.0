import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { productSlugs } from "./header";
import { ExternalIcon } from "./sections";
import { Logo } from "./ui/logo";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const p = await getTranslations("products");
  const groups = [
    { title: nav("products"), links: [...productSlugs.map((s) => [`/products/${s}`, p(`${s}.name`)]), ["/products", nav("allProducts")], ["/apply", nav("callback")]] },
    { title: nav("platform"), links: [["/how-it-works", nav("howItWorks")], ["/technology", nav("technology")], ["/network", nav("network")], ["/impact", nav("impact")]] },
    { title: nav("company"), links: [["/about", nav("about")], ["/team", nav("team")], ["/partners", nav("partners")], ["/news", nav("newsroom")], ["/careers", nav("careers")], ["/investors", nav("investors")], ["/support", nav("support")]] },
    { title: t("legal"), links: [["/legal/privacy-policy", t("privacy")], ["/legal/terms-and-conditions", t("terms")], ["/legal/grievance-redressal", t("grievance")], ["/legal", t("allLegal")]] },
  ];
  const link = "inline-flex min-h-10 items-center underline-offset-4 hover:underline";

  return (
    <footer className="on-dark bg-deep text-white">
      <div className="container-site section-tight grid-site gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <Logo onDark className="h-9 w-auto" />
          <p className="t-small mt-4 max-w-sm text-mint">{t("tagline")}</p>
          <p className="t-small mt-3 text-mint">
            <a href="mailto:help@prosparity.in" className="underline underline-offset-4">help@prosparity.in</a>
          </p>
          <a href="https://battron.in" target="_blank" rel="noopener" className={`${link} mt-1`}>battron.in<ExternalIcon /></a>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="col-span-2 lg:col-span-2">
            <h2 className="t-small font-[540] text-mint">{group.title}</h2>
            <ul className="mt-2">
              {group.links.map(([href, label]) => (
                <li key={`${href}${label}`}><Link href={href ?? "/"} prefetch={false} className={link}>{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
        <p className="t-small col-span-4 border-t border-hairline-dark pt-6 text-mint md:col-span-8 lg:col-span-12">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
