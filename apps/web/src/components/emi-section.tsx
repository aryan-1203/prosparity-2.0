import { getTranslations } from "next-intl/server";
import { EmiCalculator } from "./emi-calculator";

export async function EmiSection({ band = "band-mint" }: { band?: string }) {
  const t = await getTranslations("emi");
  return (
    <section id="emi" className={`${band} scroll-mt-20`}>
      <div className="section container-site grid-site gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <h2 className="t-heading text-forest">{t("title")}</h2>
          <p className="mt-3">{t("text")}</p>
        </div>
        <div className="col-span-4 md:col-span-8">
          <EmiCalculator labels={{ amount: t("amount"), rate: t("rate"), months: t("months"), emi: t("emi"), interest: t("interest"), total: t("total"), empty: t("empty"), note: t("note") }} />
        </div>
      </div>
    </section>
  );
}
