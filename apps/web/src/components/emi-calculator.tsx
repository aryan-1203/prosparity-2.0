"use client";

import { useId, useState } from "react";

export interface EmiLabels { amount: string; rate: string; months: string; emi: string; interest: string; total: string; empty: string; note: string }

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const field = "mt-1 block min-h-12 w-full rounded-control border border-control bg-white px-3 text-base text-deep";

/** Pure arithmetic on what the visitor types. It holds no rates, so it makes no offer. */
export function EmiCalculator({ labels }: { labels: EmiLabels }) {
  const id = useId();
  const [values, setValues] = useState({ amount: "", rate: "", months: "" });
  const amount = Number(values.amount);
  const months = Number(values.months);
  const monthly = Number(values.rate) / 1200;
  const ready = amount > 0 && months > 0 && Number(values.rate) > 0;
  const emi = ready ? (amount * monthly * (1 + monthly) ** months) / ((1 + monthly) ** months - 1) : 0;

  const inputs = [["amount", labels.amount], ["rate", labels.rate], ["months", labels.months]] as const;
  return (
    <div className="grid gap-6 rounded-panel bg-white p-6 md:grid-cols-2 lg:p-8">
      <div className="space-y-4">
        {inputs.map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`${id}-${key}`} className="font-[520]">{label}</label>
            <input
              id={`${id}-${key}`}
              type="text"
              inputMode="decimal"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value.replace(/[^\d.]/g, "") }))}
              className={field}
            />
          </div>
        ))}
      </div>
      <div aria-live="polite" className="flex flex-col justify-center rounded-control bg-leaf p-6">
        {ready ? (
          <dl>
            <dt className="text-slate">{labels.emi}</dt>
            <dd className="t-title tabular-nums m-0 text-forest">{inr.format(emi)}</dd>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              <div><dt className="t-small text-slate">{labels.interest}</dt><dd className="tabular-nums m-0">{inr.format(emi * months - amount)}</dd></div>
              <div><dt className="t-small text-slate">{labels.total}</dt><dd className="tabular-nums m-0">{inr.format(emi * months)}</dd></div>
            </div>
          </dl>
        ) : (
          <p className="text-slate">{labels.empty}</p>
        )}
        <p className="t-small mt-4 text-slate">{labels.note}</p>
      </div>
    </div>
  );
}
