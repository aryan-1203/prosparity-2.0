import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cta, Intro, LinkOut } from "@/components/sections";
import { advisor, core, leaders, type Person } from "@/components/team";
import { pageMeta, type PageParams } from "@/lib/meta";

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "team", "/team");
}

async function People({ people }: { people: readonly Person[] }) {
  const team = await getTranslations("team");
  return (
    <ul>
      {people.map((p) => (
        <li key={p.id} className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-5 border-t border-hairline py-6 last:border-b md:grid-cols-[112px_minmax(0,4fr)_minmax(0,7fr)]">
          {p.photo ? (
            <Image src={p.photo} alt="" width={112} height={112} className="size-[72px] rounded-full bg-mint object-cover md:size-24" />
          ) : (
            <span aria-hidden="true" className="flex size-[72px] items-center justify-center rounded-full bg-mint text-xl font-[540] text-forest md:size-24">{p.name.charAt(0)}</span>
          )}
          <div>
            <h3 className="t-subhead text-forest">{p.name}</h3>
            <p className="text-slate">{team(`${p.id}.role`)}</p>
            {p.linkedin && <LinkOut href={p.linkedin} className="t-small mt-1 inline-flex items-center text-forest underline underline-offset-4">LinkedIn</LinkOut>}
          </div>
          <p className="col-start-2 mt-2 md:col-start-3 md:mt-0">{team(`${p.id}.bio`)}</p>
        </li>
      ))}
    </ul>
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
          <h2 className="t-heading text-forest">{t("leadershipTitle")}</h2>
          <div className="mt-6"><People people={leaders} /></div>
        </div>
      </section>
      <section className="band-leaf">
        <div className="section container-site">
          <h2 className="t-heading text-forest">{t("coreTitle")}</h2>
          <div className="mt-6"><People people={[...core, advisor]} /></div>
        </div>
      </section>
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/careers" secondary={t("ctaSecondary")} secondaryHref="/about" />
    </>
  );
}
