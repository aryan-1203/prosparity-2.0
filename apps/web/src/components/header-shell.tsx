"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "./ui/logo";

export interface NavItem { href: string; label: string }

interface Props {
  items: NavItem[];
  locale: Locale;
  labels: { callback: string; menu: string; close: string; primary: string; home: string; language: string };
}

const other = { en: { locale: "hi", name: "हिन्दी" }, hi: { locale: "en", name: "English" } } as const;

export function HeaderShell({ items, locale, labels }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const target = other[locale];

  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const switcher = (
    <Link
      href={pathname}
      prefetch={false}
      locale={target.locale}
      lang={target.locale}
      aria-label={`${labels.language}: ${target.name}`}
      className="inline-flex min-h-11 items-center px-2 text-[0.9375rem] text-deep underline-offset-4 hover:underline"
    >
      {target.name}
    </Link>
  );

  return (
    <header className="site-header" data-scrolled={scrolled || open}>
      <div className="container-site flex h-full items-center justify-between gap-3">
        <Link href="/" prefetch={false} aria-label={labels.home} className="shrink-0"><Logo className="h-7 w-auto sm:h-8" /></Link>
        <nav aria-label={labels.primary} className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="inline-flex min-h-11 items-center whitespace-nowrap text-[0.9375rem] underline-offset-4 hover:underline aria-[current=page]:font-[560] aria-[current=page]:text-forest"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1 lg:gap-3">
          <div className="hidden lg:block">{switcher}</div>
          <Link href="/lending#callback" prefetch={false} className="btn btn-primary btn-sm whitespace-nowrap max-[420px]:px-3 max-[420px]:text-sm">
            {labels.callback}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-[0.9375rem] font-[540] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? labels.close : labels.menu}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label={labels.primary} className="fixed inset-x-0 bottom-0 top-(--header-h) overflow-y-auto bg-white lg:hidden">
          <ul className="container-site pb-8">
            {items.map((item) => (
              <li key={item.href} className="border-b border-hairline">
                <Link href={item.href} prefetch={false} className="t-subhead flex min-h-16 items-center text-forest">{item.label}</Link>
              </li>
            ))}
            <li className="pt-4">{switcher}</li>
          </ul>
        </nav>
      )}
    </header>
  );
}
