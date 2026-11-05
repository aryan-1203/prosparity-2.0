import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backers } from "@/components/home/logos";
import { Blocks, Cta, Intro, type Block } from "@/components/sections";
import { pageMeta, type PageParams } from "@/lib/meta";

type Event = { date: string; text: string };

export async function generateMetadata({ params }: PageParams) {
  return pageMeta((await params).locale, "about", "/about");
}

export default async function AboutPage({ params }: PageParams) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("pages.about");
  return (
    <>
      <Intro wide title={t("title")} lead={t("lead")} />
      <Blocks blocks={(t.raw("blocks") as Block[]).slice(0, 2)} />
      <section className="band-mint">
        <div className="section container-site">
          <h2 className="t-title text-forest">{t("timelineTitle")}</h2>
          <ol className="mt-8 border-l-[3px] border-forest pl-6 lg:grid lg:grid-cols-6 lg:gap-x-6 lg:border-l-0 lg:border-t-[3px] lg:pl-0">
            {(t.raw("timeline") as Event[]).map((event) => (
              <li key={event.date} className="pb-6 lg:pb-0 lg:pt-5">
                <p className="t-subhead text-forest">{event.date}</p>
                <p className="mt-1">{event.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Blocks blocks={(t.raw("blocks") as Block[]).slice(2)} />
      <section className="band-leaf">
        <div className="section-tight container-site">
          <h2 className="t-heading text-forest">{t("backersTitle")}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {backers.map((logo) => (
              <li key={logo.name} className="rounded-control bg-white">
                <a href={logo.href} rel="noopener" target="_blank" className="flex h-24 items-center justify-center p-5">
                  <Image src={logo.src} alt={logo.name} width={303} height={151} className="max-h-14 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Cta title={t("ctaTitle")} text={t("ctaText")} primary={t("ctaPrimary")} primaryHref="/team" secondary={t("ctaSecondary")} secondaryHref="/careers" />
    </>
  );
}
