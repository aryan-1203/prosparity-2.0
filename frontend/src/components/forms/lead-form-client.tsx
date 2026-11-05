"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "@/i18n/navigation";
import type { Field, LeadType } from "@/lib/forms";

export interface FormLabels {
  fields: Record<string, string>;
  options: Record<string, string>;
  errors: Record<string, string>;
  optional: string;
  choose: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  submit: string;
  sending: string;
  summary: string;
  successTitle: string;
  successText: string;
  failure: string;
}

interface Props {
  type: LeadType;
  formFields: readonly Field[];
  labels: FormLabels;
  privacyHref: string;
  locale: string;
  battron?: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const PRODUCT_TO_VEHICLE: Record<string, string> = { "electric-2-wheeler": "e2w", "electric-3-wheeler": "e3w", "l5-cargo": "cargo" };
const control = "mt-1 block min-h-12 w-full rounded-control border border-control bg-white px-3 text-base text-deep";

export function LeadFormClient({ type, formFields, labels, privacyHref, locale, battron = false }: Props) {
  const id = useId();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  useEffect(() => {
    if (!TURNSTILE) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.head.append(script);
    return () => script.remove();
  }, []);

  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    const value = product && PRODUCT_TO_VEHICLE[product];
    const select = formRef.current?.elements.namedItem("vehicleType");
    if (value && select instanceof HTMLSelectElement) select.value = value;
  }, []);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    for (const field of formFields) values[field.name] = String(form.get(field.name) ?? "");

    const { validate } = await import("@/lib/form-schema");
    const result = validate(type, values);
    const found: Record<string, string> = { ...result.errors };
    if (!form.get("consent")) found.consent = "consent";
    setErrors(found);
    if (Object.keys(found).length > 0 || !result.data) {
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("sending");
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(["source", "medium", "campaign", "term", "content"].map((k) => [`utm_${k}`, params.get(`utm_${k}`)]));
    try {
      const response = await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          locale,
          source_page: pathname,
          consent: true,
          website: String(form.get("website") ?? ""),
          turnstile_token: String(form.get("cf-turnstile-response") ?? "") || null,
          payload: result.data,
          ...utm,
        }),
      });
      setStatus(response.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-panel bg-mint p-8 outline-none">
        <p className="t-subhead text-forest">{labels.successTitle}</p>
        <p className="mt-2">{labels.successText}</p>
      </div>
    );
  }

  const errorKeys = Object.keys(errors);
  const message = (key: string) => labels.errors[errors[key] ?? ""] ?? "";
  const fieldId = (name: string) => `${id}-${name}`;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-5">
      {errorKeys.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-control border border-error p-4 outline-none">
          <p className="font-[540] text-error">{labels.summary}</p>
          <ul className="mt-2 list-disc pl-5">
            {errorKeys.map((key) => (
              <li key={key}>
                <a href={`#${fieldId(key)}`} className="underline underline-offset-4">
                  {key === "consent" ? labels.errors.consent : `${labels.fields[key]}: ${message(key)}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formFields.map((field) => {
        const invalid = Boolean(errors[field.name]);
        const shared = {
          id: fieldId(field.name),
          name: field.name,
          required: field.required,
          autoComplete: field.autoComplete,
          "aria-invalid": invalid || undefined,
          "aria-describedby": invalid ? `${fieldId(field.name)}-error` : undefined,
        };
        return (
          <div key={field.name}>
            <label htmlFor={shared.id} className="font-[520]">
              {labels.fields[field.name]}
              {!field.required && <span className="font-normal text-slate"> {labels.optional}</span>}
            </label>
            {field.kind === "select" ? (
              <select {...shared} defaultValue="" className={control}>
                <option value="" disabled>{labels.choose}</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>{labels.options[`${field.name}.${option}`]}</option>
                ))}
              </select>
            ) : field.kind === "textarea" ? (
              <textarea {...shared} rows={4} className={`${control} py-3`} />
            ) : (
              <input
                {...shared}
                type={field.kind === "number" ? "text" : field.kind}
                inputMode={field.kind === "number" ? "numeric" : undefined}
                className={control}
              />
            )}
            {invalid && <p id={`${shared.id}-error`} className="t-small mt-1 text-error">{message(field.name)}</p>}
          </div>
        );
      })}

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="flex items-start gap-3">
        <input
          id={fieldId("consent")}
          type="checkbox"
          name="consent"
          required
          aria-invalid={Boolean(errors.consent) || undefined}
          className="mt-1 size-5 shrink-0 accent-forest"
        />
        <label htmlFor={fieldId("consent")} className="t-small">
          {labels.consentBefore}
          <a href={privacyHref} className="underline underline-offset-4">{labels.consentLink}</a>
          {labels.consentAfter}
        </label>
      </div>

      {TURNSTILE && <div className="cf-turnstile" data-sitekey={TURNSTILE} />}

      {status === "failed" && <p role="alert" className="text-error">{labels.failure}</p>}

      <button type="submit" disabled={status === "sending"} className={`btn ${battron ? "btn-battron" : "btn-primary"} disabled:opacity-60`}>
        {status === "sending" ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
