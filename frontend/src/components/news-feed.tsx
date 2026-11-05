"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export interface FeedItem { icon?: ReactNode; id: string; category: string; categoryLabel: string; date: string; title: string; summary: string; href?: string; url?: string; sourceLabel?: string }

function Row({ item, readMore }: { item: FeedItem; readMore: string }) {
  return (
    <li className="index-row">
      <p className="t-small flex items-center gap-2 text-slate">{item.icon}<span><span className="font-[520] text-forest">{item.categoryLabel}</span>, {item.date}</span></p>
      <h3 className="t-subhead row-name text-forest">
        {item.href ? <Link href={item.href} prefetch={false}>{item.title}</Link> : item.url ? <a href={item.url} target="_blank" rel="noopener">{item.title}</a> : item.title}
      </h3>
      <p className="t-body">{item.summary}</p>
      {item.sourceLabel && <p className="t-small text-slate">{item.sourceLabel}</p>}
      {item.href && <p className="t-small font-[540] text-forest">{readMore}</p>}
    </li>
  );
}

export function NewsList({ items, readMore, wide = false }: { items: FeedItem[]; readMore: string; wide?: boolean }) {
  return <ul className={wide ? "grid gap-x-(--gutter) lg:grid-cols-2" : undefined}>{items.map((item) => <Row key={item.id} item={item} readMore={readMore} />)}</ul>;
}

export function NewsFeed({ items, filters, label, readMore }: { items: FeedItem[]; filters: { key: string; label: string }[]; label: string; readMore: string }) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? items : items.filter((item) => item.category === active);
  return (
    <>
      <div role="group" aria-label={label} className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={active === f.key}
            onClick={() => setActive(f.key)}
            className="min-h-11 rounded-control border border-control bg-white px-4 text-[0.9375rem] aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-white"
          >
            {f.label}
          </button>
        ))}
      </div>
      <NewsList wide items={shown} readMore={readMore} />
    </>
  );
}
