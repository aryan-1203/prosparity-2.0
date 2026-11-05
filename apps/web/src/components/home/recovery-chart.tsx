import { getTranslations } from "next-intl/server";
import { MetricValue } from "../ui/metric";
import { Reveal } from "../ui/reveal";

/** Bars share one 0–100 scale. The industry bar stops at the top of its range. */
export async function RecoveryChart({ onDark = false }: { onDark?: boolean }) {
  const t = await getTranslations("home.problem");
  const muted = onDark ? "text-mint" : "text-slate";
  const rows = [
    { id: "battronRecovery", label: t("battron"), width: 65, bar: "bg-teal", ink: onDark ? "text-teal-on-dark" : "text-teal-text" },
    { id: "industryRecovery", label: t("industry"), width: 25, bar: "bg-loss", ink: onDark ? "text-loss-on-dark" : "text-loss-text" },
  ] as const;

  return (
    <figure className="m-0">
      <figcaption className={`t-small font-[520] ${onDark ? "text-white" : "text-deep"}`}>{t("chartTitle")}</figcaption>
      <div aria-hidden="true" className="mt-6 space-y-6">
        {rows.map((row, i) => (
          <div key={row.id}>
            <div className="flex items-baseline justify-between gap-4">
              <span className={onDark ? "text-white" : "text-deep"}>{row.label}</span>
              <span className={`t-heading ${row.ink}`}><MetricValue id={row.id} /></span>
            </div>
            <div className={`mt-2 h-3 w-full ${onDark ? "bg-hairline-dark" : "bg-pale"}`}>
              <div className="h-full" style={{ width: `${row.width}%` }}>
                <Reveal variant="draw" delay={i * 50} className={`draw-origin h-full rounded-cell ${row.bar}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <thead><tr><th scope="col">{t("tableMethod")}</th><th scope="col">{t("tableShare")}</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id}><th scope="row">{row.label}</th><td><MetricValue id={row.id} /></td></tr>)}
        </tbody>
      </table>
      <p className={`t-small mt-5 ${muted}`}>{t("note")}</p>
    </figure>
  );
}
