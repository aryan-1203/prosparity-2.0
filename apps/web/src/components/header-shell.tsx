"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "./ui/logo";

export interface NavLink { href: string; label: string; note?: string; icon?: ReactNode }
export interface NavGroup { label: string; items: NavLink[]; all?: NavLink }

interface Props {
  groups: NavGroup[];
  support: NavLink;
  battron: { href: string; label: string; aria: string };
  locale: Locale;
  labels: { callback: string; menu: string; close: string; primary: string; home: string; language: string };
}

const other = { en: { locale: "hi", name: "हिन्दी" }, hi: { locale: "en", name: "English" } } as const;
const topLink = "inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-[0.9375rem] underline-offset-4 hover:underline";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={`size-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}

function External() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

export function HeaderShell({ groups, support, battron, locale, labels }: Props) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [openedOn, setOpenedOn] = useState(pathname);
  const target = other[locale];

  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
    setDropdown(null);
  }

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open && !dropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setDropdown(null); }
    };
    const onClick = (e: MouseEvent) => {
      if (!nav.current?.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      document.body.style.overflow = "";
    };
  }, [open, dropdown]);

  const switcher = (
    <Link href={pathname} prefetch={false} locale={target.locale} lang={target.locale} aria-label={`${labels.language}: ${target.name}`} className={topLink}>
      {target.name}
    </Link>
  );

  return (
    <header className="site-header" data-scrolled={scrolled || open || Boolean(dropdown)}>
      <div className="container-site flex h-full items-center justify-between gap-3">
        <Link href="/" prefetch={false} aria-label={labels.home} className="shrink-0"><Logo className="h-7 w-auto sm:h-8" /></Link>

        <nav ref={nav} aria-label={labels.primary} className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {groups.map((group) => {
              const isOpen = dropdown === group.label;
              return (
                <li key={group.label} className="relative">
                  <button type="button" className={topLink} aria-expanded={isOpen} onClick={() => setDropdown(isOpen ? null : group.label)}>
                    {group.label}
                    <Chevron open={isOpen} />
                  </button>
                  {isOpen && (
                    <div className="nav-panel absolute left-1/2 top-full z-50 mt-2 w-[22rem] -translate-x-1/2 rounded-panel bg-white p-3">
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} prefetch={false} className="flex items-center gap-3 rounded-control px-3 py-2 hover:bg-leaf">
                              {item.icon}
                              <span>
                                <span className="block font-[540] text-forest">{item.label}</span>
                                {item.note && <span className="t-small block text-slate">{item.note}</span>}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {group.all && <Link href={group.all.href} prefetch={false} className="text-link px-3">{group.all.label}</Link>}
                    </div>
                  )}
                </li>
              );
            })}
            <li><Link href={support.href} prefetch={false} className={topLink}>{support.label}</Link></li>
            <li>
              <a href={battron.href} target="_blank" rel="noopener" aria-label={battron.aria} className={`${topLink} font-[540] text-teal-text`}>
                {battron.label}
                <External />
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-1 lg:gap-3">
          <div className="hidden lg:block">{switcher}</div>
          <Link href="/apply" prefetch={false} className="btn btn-primary btn-sm whitespace-nowrap max-[420px]:px-3 max-[420px]:text-sm">{labels.callback}</Link>
          <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center text-[0.9375rem] font-[540] lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
            {open ? labels.close : labels.menu}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={labels.primary} className="fixed inset-x-0 bottom-0 top-(--header-h) overflow-y-auto bg-white lg:hidden">
          <div className="container-site pb-8">
            {groups.map((group) => (
              <div key={group.label} className="border-b border-hairline py-3">
                <p className="t-small font-[540] text-slate">{group.label}</p>
                <ul className="mt-1">
                  {[...group.items, ...(group.all ? [group.all] : [])].map((item) => (
                    <li key={item.href + item.label}><Link href={item.href} prefetch={false} className="flex min-h-11 items-center text-forest">{item.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href={support.href} prefetch={false} className="flex min-h-14 items-center border-b border-hairline font-[540] text-forest">{support.label}</Link>
            <a href={battron.href} target="_blank" rel="noopener" aria-label={battron.aria} className="flex min-h-14 items-center gap-1 border-b border-hairline font-[540] text-teal-text">{battron.label}<External /></a>
            <div className="pt-3">{switcher}</div>
          </div>
        </nav>
      )}
    </header>
  );
}
