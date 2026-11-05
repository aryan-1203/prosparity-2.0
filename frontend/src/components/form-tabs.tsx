"use client";

import { useState, type ReactNode } from "react";

/** All forms are server-rendered; this only chooses which one shows. */
export function FormTabs({ tabs, label }: { tabs: { key: string; label: string; form: ReactNode }[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <>
      <div role="group" aria-label={label} className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" aria-pressed={active === tab.key} onClick={() => setActive(tab.key)} className="min-h-11 rounded-control border border-control bg-white px-4 text-[0.9375rem] aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-white">
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => <div key={tab.key} hidden={active !== tab.key}>{tab.form}</div>)}
    </>
  );
}
