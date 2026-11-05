import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { LeadType } from "@/lib/forms";
import type { MetricId } from "@content/metrics";
import { LeadForm } from "./forms/lead-form";
import { MetricValue } from "./ui/metric";
import { Reveal } from "./ui/reveal";

export function Intro({ title, lead, aside, ink = "text-forest", wide = false }: { title: string; lead?: string; aside?: ReactNode; ink?: string; wide?: boolean }) {
  return (
    <section className="container-site grid-site gap-y-10 pb-(--section-tight) pt-[clamp(40px,8vh,96px)]">
      <div className={`col-span-4 md:col-span-8 ${wide ? "lg:col-span-8" : "lg:col-span-7"}`}>
        <h1 className={`t-display ${ink}`}>{title}</h1>
        {lead && <p className="t-lead mt-6">{lead}</p>}
      </div>
      {aside && <div className={`col-span-4 md:col-span-8 lg:self-end ${wide ? "lg:col-span-4" : "lg:col-span-5"}`}>{aside}</div>}
    </section>
  );
}

export function Rail({ title, intro, children, ink = "text-forest" }: { title: string; intro?: string; children: ReactNode; ink?: string }) {
  return (
    <section className="section container-site grid-site gap-y-8">
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
          <h2 className={`t-title ${ink}`}>{title}</h2>
          {intro && <p className="mt-4 text-slate">{intro}</p>}
        </div>
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-start-5">{children}</div>
    </section>
  );
}

export function RuledBlocks({ items, ink = "text-forest" }: { items: { name: string; text: string }[]; ink?: string }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.name} className="border-t border-hairline py-7 last:border-b">
          <Reveal delay={(i % 3) * 50}>
            <h3 className={`t-subhead ${ink}`}>{item.name}</h3>
            <p className="t-body mt-2">{item.text}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export function NumberedPath({ steps }: { steps: { name: string; text: string }[] }) {
  return (
    <ol>
      {steps.map((step, i) => (
        <li key={step.name} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0">
          {i < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[19px] top-10 w-px bg-hairline" />}
          <span aria-hidden="true" className="tabular-nums flex size-10 items-center justify-center rounded-full border border-forest font-[540] text-forest">{i + 1}</span>
          <div className="pt-1">
            <h3 className="t-subhead text-forest">{step.name}</h3>
            <p className="t-body mt-1">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export async function FigureList({ ids, label }: { ids: readonly { id: MetricId; label?: string }[]; label?: string }) {
  const m = await getTranslations("metrics");
  return (
    <dl aria-label={label} className="grid md:grid-cols-2 md:gap-x-(--gutter)">
      {ids.map(({ id, label: custom }, i) => (
        <Reveal key={id} delay={(i % 2) * 50} className="flex flex-col gap-1 border-t border-hairline-dark py-6">
          <dt className="text-mint">{custom ?? m(id)}</dt>
          <dd className="t-title order-first m-0 text-signal"><MetricValue id={id} animate /></dd>
        </Reveal>
      ))}
    </dl>
  );
}

export function FormSplit({ id = "enquiry", title, text, type, battron = false, aside }: { id?: string; title: string; text: string; type: LeadType; battron?: boolean; aside?: ReactNode }) {
  return (
    <section id={id} className="section-tight bg-pale">
      <div className="container-site grid-site gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <h2 className={`t-title ${battron ? "text-teal-text" : "text-forest"}`}>{title}</h2>
          <p className="t-lead mt-4">{text}</p>
          {aside}
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"><LeadForm type={type} battron={battron} /></div>
      </div>
    </section>
  );
}

export function IndexList({ rows }: { rows: { name: string; text: string; href: string }[] }) {
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.name} className="index-row md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-baseline">
          <Link href={row.href} className="row-name t-subhead text-forest">{row.name}</Link>
          <p className="text-slate">{row.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** A visibly marked gap. Never ship one of these without an entry in docs/OPEN_ITEMS.md. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <p className="rounded-tag border border-dashed border-control bg-pale px-4 py-3 text-slate">{children}</p>;
}
