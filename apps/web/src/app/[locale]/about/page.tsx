import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { advisor, leaders } from "@/components/team";
import { pageMeta, type PageParams } from "@/lib/meta";

type Event = { date: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "about", "/about");
}

export default async function AboutPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.about");
  const team = await getTranslations("team");
  const people = [...leaders, advisor];
  return (
    <>
      <section className="container-site grid-site pb-(--section-tight) pt-[clamp(40px,8vh,96px)]">
        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-3">
          <h1 className="t-display text-forest">{t("title")}</h1>
          <p className="t-lead mt-6">{t("lead")}</p>
        </div>
      </section>
      <section className="section-tight container-site">
        <h2 className="t-title text-forest">{t("timelineTitle")}</h2>
        <ol className="mt-10 border-l-[3px] border-forest pl-6 lg:grid lg:grid-cols-6 lg:gap-x-6 lg:border-l-0 lg:border-t-[3px] lg:pl-0">
          {(t.raw("timeline") as Event[]).map((event) => (
            <li key={event.date} className="pb-8 lg:pb-0 lg:pt-5">
              <p className="t-subhead text-forest">{event.date}</p>
              <p className="t-small mt-1">{event.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="section container-site">
        <h2 className="t-title text-forest">{t("leadershipTitle")}</h2>
        <ul className="mt-8">
          {people.map((p) => (
            <li key={p.id} className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-5 border-t border-hairline py-6 last:border-b md:grid-cols-[112px_minmax(0,4fr)_minmax(0,7fr)]">
              {p.photo ? (
                <Image src={p.photo} alt="" width={112} height={112} className="size-[72px] rounded-full object-cover md:size-24" />
              ) : (
                <span aria-hidden="true" className="flex size-[72px] items-center justify-center rounded-full bg-pale text-xl font-[540] text-forest md:size-24">{p.name.charAt(0)}</span>
              )}
              <div>
                <h3 className="t-subhead text-forest">{p.name}</h3>
                <p className="text-slate">{team(`${p.id}.role`)}</p>
              </div>
              <p className="col-start-2 mt-2 md:col-start-3 md:mt-0">{team(`${p.id}.bio`)}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
