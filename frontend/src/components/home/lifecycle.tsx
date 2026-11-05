import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MetricValue } from "../ui/metric";
import { Reveal } from "../ui/reveal";
import { EvDefs, inks, PackCells, PROPS, Scene, STAGES } from "./ev-art";
import { GaugeCells } from "./gauge";
import { LifecycleGate } from "./lifecycle-gate";

const NO_JS = ".lc-root{display:block!important}.lc-stage{display:none!important}.lc-hero-vehicle,.lc-scene{display:block!important}.lc-step-gauge{display:flex!important}.lc-story,.lc-steps,.lc-hero-copy{width:auto!important;max-width:none!important}.lc-step{min-height:0!important;display:block!important;padding-block:32px!important}";

function Stage({ labels }: { labels: string[] }) {
  return (
    <div className="lc-stage" aria-hidden="true">
      <svg viewBox="0 0 960 400" preserveAspectRatio="xMinYMax meet" className="absolute bottom-[60px] left-0 h-[calc(100%-60px)] w-full" focusable="false">
        <line x1="0" y1="397" x2="6000" y2="397" stroke="var(--color-forest)" strokeWidth="3" />
        <svg x="0" y="0" width="960" height="400" viewBox="0 0 960 400">
          <g data-lc="strip" className="will-change-transform" style={inks.prosparity}>
            {PROPS.map((art, i) => {
              const owner = STAGES[i]?.owner ?? "prosparity";
              const hook = i === 0 ? "first-prop" : i === 4 ? "loop" : undefined;
              return (
                <g key={i} transform={`translate(${960 * i} 0)`} style={inks[owner]}>
                  <g data-lc={hook} opacity={hook ? 0 : 1}>{art}</g>
                </g>
              );
            })}
          </g>
        </svg>
        <use href="#ev" transform="translate(160 40)" style={inks.prosparity} />
        <use href="#ev" data-lc="teal" transform="translate(160 40)" style={{ ...inks.battron, opacity: 0 }} />
        <PackCells hook />
      </svg>
      <div data-lc="gauge" className="absolute bottom-3 left-2 flex items-center gap-3 opacity-0">
        <GaugeCells hook />
        <span className="lc-gauge-label t-small text-slate">
          {labels.map((label, i) => <span key={label} data-lc-label={i} style={{ opacity: 0 }}>{label}</span>)}
        </span>
      </div>
    </div>
  );
}

export async function Lifecycle() {
  const t = await getTranslations("home");
  const m = await getTranslations("metrics");

  return (
    <section id="lifecycle" aria-labelledby="hero-title" className="lc-root">
      <EvDefs />
      <noscript><style>{NO_JS}</style></noscript>
      <Stage labels={STAGES.map((s) => t(`lifecycle.stages.${s.key}.gauge`))} />
      <div className="lc-story container-site">
        <header className="lc-hero-copy pt-[clamp(40px,10vh,112px)]">
          <h1 id="hero-title" className="t-display text-forest">{t("hero.title")}</h1>
          <p className="t-lead mt-6">{t("hero.lead")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/products" prefetch={false} className="btn btn-primary">{t("hero.primary")}</Link>
            <a href="#how-it-works" className="text-link">{t("hero.secondary")}</a>
          </div>
          <dl className="lc-hero-figs mt-8 grid max-w-xl grid-cols-3 gap-x-4">
            {(["disbursed", "dealers", "cities"] as const).map((id) => (
              <div key={id} className="flex flex-col gap-0.5 border-t-2 border-forest pt-2">
                <dt className="t-small text-slate">{m(id)}</dt>
                <dd className="t-subhead order-first m-0 text-forest"><MetricValue id={id} /></dd>
              </div>
            ))}
          </dl>
          <div className="lc-hero-vehicle lc-road-bleed mt-10 overflow-x-clip">
            <svg viewBox="0 30 640 330" className="mx-auto h-auto w-full max-w-[560px] overflow-visible px-4" aria-hidden="true" focusable="false" style={inks.prosparity}>
              <line x1="-1600" y1="357" x2="2240" y2="357" stroke="var(--color-forest)" strokeWidth="3" />
              <use href="#ev" />
            </svg>
          </div>
        </header>

        <h2 id="how-it-works" className="sr-only">{t("lifecycle.label")}</h2>
        <ol data-lc-steps className="lc-steps mt-8 lg:mt-0">
          {STAGES.map((stage, i) => {
            const name = t(`lifecycle.stages.${stage.key}.name`);
            const ink = stage.owner === "battron" ? "text-teal-text" : "text-forest";
            return (
              <li key={stage.key} data-stage={i + 1} className="lc-step">
                <Reveal className="lc-step-grid">
                  <div className="lc-scene mb-5 lg:mb-0"><Scene index={i} /></div>
                  <div>
                    <div className="lc-step-gauge mb-4 flex flex-wrap items-center gap-3">
                      <GaugeCells filled={i + 1} />
                      <span className="t-small text-slate">{t(`lifecycle.stages.${stage.key}.gauge`)}</span>
                    </div>
                    <p className={`t-small font-[520] ${ink}`}>
                      {t("lifecycle.stageOf", { n: i + 1 })}, {t(`lifecycle.owner.${stage.owner}`)}
                    </p>
                    <h3 className={`t-heading mt-1 ${ink}`}>{name}</h3>
                    <p className="t-lead mt-3">{t(`lifecycle.stages.${stage.key}.text`)}</p>
                    <p className="mt-3 text-slate">{t(`lifecycle.stages.${stage.key}.detail`)}</p>
                    {i === 4 && <p className="t-subhead mt-5 text-forest">{t("lifecycle.close")}</p>}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
      <LifecycleGate />
    </section>
  );
}
