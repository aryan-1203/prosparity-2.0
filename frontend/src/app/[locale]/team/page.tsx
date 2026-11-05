import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cta, Intro } from "@/components/sections";
import { advisor, core, founders, type Person } from "@/components/team";
import { TeamCard } from "@/components/team-card";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "team", "/team");
}

async function Card({ person, size }: { person: Person; size: "large" | "small" }) {
  const team = await getTranslations("team");
  const t = await getTranslations("pages.team");
  return (
    <TeamCard
      name={person.name}
      role={team(`${person.id}.role`)}
      bio={team(`${person.id}.bio`)}
      photo={person.photo}
      linkedin={person.linkedin}
      size={size}
      labels={{ open: t("openProfile"), close: t("closeProfile"), linkedin: t("onLinkedIn") }}
    />
  );
}

export default async function TeamPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.team");
  return (
    <>
      <Intro title={t("title")} lead={t("lead")} />
      <section className="band-white">
        <div className="section container-site">
          <h2 className="t-title text-forest">{t("foundersTitle")}</h2>
          <p className="t-lead mt-3">{t("foundersText")}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {founders.map((person) => <li key={person.id}><Card person={person} size="large" /></li>)}
          </ul>
        </div>
      </section>
      <section className="band-mint">
        <div className="section container-site">
          <h2 className="t-title text-forest">{t("coreTitle")}</h2>
          <p className="t-lead mt-3">{t("coreText")}</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...core, advisor].map((person) => <li key={person.id}><Card person={person} size="small" /></li>)}
            <li className="col-span-2 lg:col-span-2">
              <Link href="/careers" prefetch={false} className="flex h-full min-h-48 flex-col justify-between rounded-panel bg-forest p-6 text-white">
                <span className="flex size-11 items-center justify-center rounded-control bg-signal text-deep"><Icon name="Sprout" className="size-[22px]" /></span>
                <span>
                  <span className="t-small block text-mint">{t("seatLabel")}</span>
                  <span className="t-heading mt-1 block">{t("seatTitle")}</span>
                  <span className="mt-1 block text-mint">{t("seatLink")}</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/careers" secondary={t("ctaSecondary")} secondaryHref="/about" />
    </>
  );
}
