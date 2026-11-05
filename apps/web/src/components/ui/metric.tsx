import { getTranslations } from "next-intl/server";
import { metrics, type MetricId } from "@content/metrics";
import { CountUp } from "./count-up";
import { Num } from "./num";

/** The figure and its unit. Every number on the site goes through here. */
export async function MetricValue({ id, animate = false }: { id: MetricId; animate?: boolean }) {
  const t = await getTranslations("units");
  const metric = metrics[id];
  const unit = "unit" in metric ? metric.unit : undefined;
  return (
    <span className="whitespace-nowrap">
      {animate ? <CountUp value={metric.value} /> : <Num value={metric.value} />}
      {unit === "cr" ? (
        <>
          {" "}
          <span aria-hidden="true">{t("cr")}</span>
          <span className="sr-only">{t("crSpoken")}</span>
        </>
      ) : unit ? (
        <>{" "}{t(unit)}</>
      ) : null}
    </span>
  );
}
