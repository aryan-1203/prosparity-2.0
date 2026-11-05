import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { fields, type LeadType } from "@/lib/forms";
import { LeadFormClient, type FormLabels } from "./lead-form-client";

export async function LeadForm({ type, battron = false }: { type: LeadType; battron?: boolean }) {
  const t = await getTranslations("forms");
  const locale = (await getLocale()) as Locale;
  const list = fields[type];
  const labels: FormLabels = {
    fields: Object.fromEntries(list.map((f) => [f.name, t(`fields.${f.name}`)])),
    options: Object.fromEntries(list.flatMap((f) => (f.options ?? []).map((o) => [`${f.name}.${o}`, t(`options.${f.name}.${o}`)]))),
    errors: { required: t("errors.required"), email: t("errors.email"), phone: t("errors.phone"), number: t("errors.number"), consent: t("errors.consent") },
    optional: t("optional"),
    choose: t("choose"),
    consentBefore: t("consentBefore"),
    consentLink: t("consentLink"),
    consentAfter: t("consentAfter"),
    submit: t(`submit.${type}`),
    sending: t("sending"),
    summary: t("summary"),
    successTitle: t("successTitle"),
    successText: t("successText"),
    failure: t("failure"),
  };
  return (
    <LeadFormClient
      type={type}
      formFields={list}
      labels={labels}
      locale={locale}
      battron={battron}
      privacyHref={getPathname({ href: "/legal/privacy-policy", locale })}
    />
  );
}
