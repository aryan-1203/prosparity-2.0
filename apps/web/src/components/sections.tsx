import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { LeadType } from "@/lib/forms";
import type { MetricId } from "@content/metrics";
import { LeadForm } from "./forms/lead-form";
import { Icon, IconTile } from "./ui/icon";
import { MetricValue } from "./ui/metric";
import { Reveal } from "./ui/reveal";

export function Intro({ eyebrow, title, lead, aside, ink = "text-forest", wide = false, children }: { eyebrow?: string; title: string; lead?: string; aside?: ReactNode; ink?: string; wide?: boolean; children?: ReactNode }) {
  return (
    <section className="container-site grid-site gap-y-10 pb-(--section-tight) pt-[clamp(32px,6vh,72px)]">
      <div className={`col-span-4 md:col-span-8 ${wide ? "lg:col-span-8" : "lg:col-span-7"}`}>
        {eyebrow && <p className="t-subhead mb-2 text-teal-text">{eyebrow}</p>}
        <h1 className={`t-display ${ink}`}>{title}</h1>
        {lead && <p className="t-lead mt-6">{lead}</p>}
        {children}
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

export function RuledBlocks({ items, ink = "text-forest" }: { items: Item[]; ink?: string }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.name} className="border-t border-hairline py-7 last:border-b">
          <Reveal delay={(i % 3) * 50} className="flex items-start gap-4">
            {item.icon && <IconTile name={item.icon} />}
            <div>
              <h3 className={`t-subhead ${ink}`}>{item.name}</h3>
              <p className="t-body mt-1">{item.text}</p>
            </div>
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

const METRIC_ICONS: Partial<Record<MetricId, string>> = { disbursed: "IndianRupee", loans: "FileCheck", aum: "Wallet", dealers: "Store", cities: "MapPin", lendingPartners: "Handshake", states: "MapIcon" };

export async function FigureList({ ids, label }: { ids: readonly { id: MetricId; label?: string }[]; label?: string }) {
  const m = await getTranslations("metrics");
  return (
    <dl aria-label={label} className="grid md:grid-cols-2 md:gap-x-(--gutter)">
      {ids.map(({ id, label: custom }, i) => (
        <Reveal key={id} delay={(i % 2) * 50} className="flex flex-col gap-1 border-t border-hairline-dark py-6">
          <dt className="text-mint">{custom ?? m(id)}</dt>
          <dd className="t-title order-first m-0 flex items-center gap-3 text-signal"><Icon name={METRIC_ICONS[id] ?? "Gauge"} className="size-8 shrink-0" /><MetricValue id={id} animate /></dd>
        </Reveal>
      ))}
    </dl>
  );
}

export function FormSplit({ id = "enquiry", title, text, type, battron = false, aside }: { id?: string; title: string; text: string; type: LeadType; battron?: boolean; aside?: ReactNode }) {
  return (
    <section id={id} className="section-tight band-sage scroll-mt-20">
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

export function IndexList({ rows }: { rows: { name: string; text: string; href: string; icon?: string }[] }) {
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.name} className="index-row md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-baseline">
          <Link href={row.href} prefetch={false} className="row-name t-subhead flex items-center gap-3 text-forest">{row.icon && <IconTile name={row.icon} />}{row.name}</Link>
          <p className="text-slate">{row.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** A visibly marked gap. Never ship one of these without an entry in docs/OPEN_ITEMS.md. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <p className="rounded-tag border border-dashed border-control bg-white px-4 py-3 text-slate">{children}</p>;
}

export type Item = { name: string; text: string; href?: string; icon?: string };
export type Block =
  | { type: "rail" | "steps" | "grid"; title: string; intro?: string; items: Item[] }
  | { type: "links"; title: string; intro?: string; items: (Item & { href: string })[] }
  | { type: "prose"; title: string; paras: string[] }
  | { type: "faq"; title: string; items: { q: string; a: string }[] };

function BlockBody({ block }: { block: Block }) {
  if (block.type === "prose") return <div className="space-y-4">{block.paras.map((p) => <p key={p} className="t-body">{p}</p>)}</div>;
  if (block.type === "steps") return <NumberedPath steps={block.items} />;
  if (block.type === "links") return <IndexList rows={block.items} />;
  if (block.type === "faq") return <Faq items={block.items} />;
  if (block.type === "grid") return <TwoCol items={block.items} />;
  return <RuledBlocks items={block.items} />;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary>{item.q}</summary>
          <p className="t-body pb-5">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function TwoCol({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-x-(--gutter) md:grid-cols-2">
      {items.map((item) => (
        <li key={item.name} className="flex items-start gap-3 border-t border-hairline py-5">
          {item.icon && <IconTile name={item.icon} />}
          <div>
            <h3 className="font-[540] text-forest">{item.name}</h3>
            <p className="mt-1 text-slate">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Stacks blocks on alternating white and green bands. */
export function Blocks({ blocks, first = "white" }: { blocks: Block[]; first?: "white" | "leaf" }) {
  const order = first === "white" ? ["band-white", "band-leaf"] : ["band-leaf", "band-white"];
  return blocks.map((block, i) => (
    <section key={block.title} className={order[i % 2]}>
      <div className="section container-site grid-site gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
            <h2 className="t-heading text-forest">{block.title}</h2>
            {"intro" in block && block.intro && <p className="mt-3 text-slate">{block.intro}</p>}
          </div>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-start-5"><BlockBody block={block} /></div>
      </div>
    </section>
  ));
}

export function Cta({ title, text, primary, primaryHref, secondary, secondaryHref }: { title: string; text?: string; primary: string; primaryHref: string; secondary?: string; secondaryHref?: string }) {
  return (
    <section className="band-sage">
      <div className="section-tight container-site grid-site items-end gap-y-6">
        <div className="col-span-4 md:col-span-8">
          <h2 className="t-title text-forest">{title}</h2>
          {text && <p className="t-lead mt-3">{text}</p>}
        </div>
        <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
          <Link href={primaryHref} className="btn btn-primary">{primary}</Link>
          {secondary && secondaryHref && <Link href={secondaryHref} className="text-link">{secondary}</Link>}
        </div>
      </div>
    </section>
  );
}

export function LinkOut({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <ExternalIcon />
    </a>
  );
}

export function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="ml-1 inline size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}
