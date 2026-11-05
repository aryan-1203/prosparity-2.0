import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./ui/logo";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const groups = [
    { title: t("forYou"), links: [["/dealers", nav("dealers")], ["/lending-partners", nav("lenders")], ["/investors", nav("investors")], ["/lending", nav("lending")], ["/battron", nav("battron")]] },
    { title: t("company"), links: [["/about", nav("about")], ["/careers", nav("careers")], ["/contact", nav("contact")]] },
    { title: t("legal"), links: [["/legal/privacy-policy", t("privacy")], ["/legal/terms-and-conditions", t("terms")], ["/legal/grievance-redressal", t("grievance")]] },
  ] as const;

  return (
    <footer className="on-dark bg-deep text-white">
      <div className="container-site section-tight grid-site gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <Logo onDark className="h-9 w-auto" />
          <p className="t-small mt-4 text-mint">{t("tagline")}</p>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="col-span-2 md:col-span-2 lg:col-span-2">
            <h2 className="t-small font-[540] text-mint">{group.title}</h2>
            <ul className="mt-3">
              {group.links.map(([href, label]) => (
                <li key={href}><Link href={href} prefetch={false} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">{label}</Link></li>
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
