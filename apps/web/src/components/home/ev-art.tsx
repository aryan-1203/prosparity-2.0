import type { CSSProperties, ReactNode } from "react";

export type Owner = "prosparity" | "battron";

export const STAGES = [
  { key: "finance", owner: "prosparity" },
  { key: "service", owner: "battron" },
  { key: "custody", owner: "battron" },
  { key: "resale", owner: "battron" },
  { key: "refinance", owner: "prosparity" },
] as const satisfies readonly { key: string; owner: Owner }[];

export const inks: Record<Owner, CSSProperties> = {
  prosparity: { "--v-ink": "#004737", "--v-tint": "#F1F6F3" } as CSSProperties,
  battron: { "--v-ink": "#00706F", "--v-tint": "#C7E9E9" } as CSSProperties,
};

const CELL_X = [228, 248, 268, 288, 308];
export const cellColor = (i: number) => (i === 0 || i === 4 ? "#004737" : "#009B9E");
const round = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Defined once per page. Everything else references it through <use>. */
export function EvDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <g id="ev" fill="none" stroke="var(--v-ink)" strokeWidth="3" {...round}>
          <circle cx="200" cy="321" r="35" fill="#fff" strokeWidth="2.5" opacity="0.45" />
          <path d="M494 236 L458 182" />
          <path strokeWidth="5" d="M458 182 L440 176" />
          <path d="M490 250 L508 321" />
          <path fill="var(--v-tint)" d="M72 214 C66 240 66 276 76 300 L120 300 A48 48 0 0 1 216 300 L460 300 C461 280 472 264 492 258 C516 252 544 262 556 292 C572 282 582 262 578 244 C574 226 552 212 530 204 C504 208 470 232 458 288 L216 288 L204 214 Z" />
          <path fill="var(--v-tint)" d="M492 64 C430 46 330 40 244 44 C172 48 114 60 92 92 C76 118 70 170 72 214 L204 214 L196 100 C300 86 400 84 484 90 C498 90 504 70 492 64 Z" />
          <path strokeWidth="2" fill="#fff" d="M106 116 C118 104 150 104 176 104 L182 196 L96 196 C94 164 98 132 106 116 Z" />
          <path d="M484 90 L530 204" />
          <path d="M346 86 L346 288" />
          <path strokeWidth="2" d="M207 208 L346 208" />
          <path transform="translate(0 6)" strokeWidth="2" fill="#fff" d="M214 100 C260 94 300 92 334 91 C340 91 340 101 334 101 C300 102 260 104 215 110 C209 111 208 101 214 100 Z" />
          <path strokeWidth="2" d="M506 144 L520 124" />
          <ellipse strokeWidth="2" cx="525" cy="115" rx="8" ry="10" transform="rotate(20 525 115)" fill="#fff" />
          <path fill="#fff" d="M222 150 C218 148 214 152 215 156 L226 232 C227 240 232 244 240 244 L326 244 C334 244 334 232 326 232 L240 232 Z" />
          <path fill="#fff" d="M366 168 C362 166 358 170 359 174 L368 226 C369 234 374 238 382 238 L428 238 C436 238 436 226 428 226 L382 226 Z" />
          <circle strokeWidth="2" cx="566" cy="244" r="9" fill="#fff" />
          <circle strokeWidth="2" cx="104" cy="256" r="8" fill="#fff" />
          <circle cx="104" cy="256" r="2.5" fill="var(--v-ink)" stroke="none" />
          <path strokeWidth="2" d="M70 236 L70 262" />
          <rect x="222" y="252" width="112" height="30" rx="4" fill="#fff" />
          {CELL_X.map((x) => <rect key={x} strokeWidth="1.5" x={x} y="258" width="16" height="18" rx="2" />)}
          <circle cx="168" cy="321" r="35" fill="#fff" />
          <circle cx="168" cy="321" r="14" fill="#fff" strokeWidth="2" />
          <circle cx="508" cy="321" r="35" fill="#fff" />
          <circle cx="508" cy="321" r="14" fill="#fff" strokeWidth="2" />
        </g>
      </defs>
    </svg>
  );
}

/** The five cells in the pack. `filled` is how many are lit; `data` hooks them for the sequence. */
export function PackCells({ filled = 5, hook = false }: { filled?: number; hook?: boolean }) {
  return (
    <g transform="translate(160 40)">
      {CELL_X.map((x, i) => (
        <rect
          key={x}
          data-lc-cell={hook ? i : undefined}
          fill={cellColor(i)}
          opacity={hook ? 0 : i < filled ? 1 : 0}
          x={x}
          y="258"
          width="16"
          height="18"
          rx="2"
        />
      ))}
    </g>
  );
}

const prop = { fill: "none", stroke: "var(--v-ink)", strokeWidth: 2, ...round };

export const PROPS: readonly ReactNode[] = [
  <g key="finance" {...prop}>
    <path d="M786 397 V186 H946 V397" />
    <path d="M772 186 L792 142 H946 V186" />
    <path d="M772 186 C772 200 800 200 800 186 C800 200 828 200 828 186 C828 200 856 200 856 186 C856 200 884 200 884 186 C884 200 912 200 912 186 C912 200 946 200 946 186" />
    <rect x="808" y="232" width="56" height="165" />
    <rect x="880" y="232" width="48" height="72" />
    <path d="M892 256 H916 M892 272 H916" />
    <rect x="38" y="214" width="84" height="112" rx="4" fill="#fff" />
    <path d="M54 240 H106 M54 258 H106 M54 276 H88" />
    <path d="M54 302 L66 312 L86 292" strokeWidth="3" />
  </g>,
  <g key="service" {...prop}>
    <path d="M116 397 V52 H872 V397" />
    <path d="M116 84 H872" opacity="0.5" />
    <rect x="28" y="232" width="62" height="165" rx="6" fill="#fff" />
    <rect x="40" y="248" width="38" height="28" rx="3" />
    <path d="M90 300 C150 372 214 356 256 300" />
  </g>,
  <g key="custody" {...prop} opacity="0.5">
    <path d="M0 214 H960 M0 270 H960" />
    <path d="M30 397 V176 L44 158 L58 176 V397 M270 397 V176 L284 158 L298 176 V397 M510 397 V176 L524 158 L538 176 V397 M750 397 V176 L764 158 L778 176 V397" />
  </g>,
  <g key="resale" {...prop}>
    <path d="M690 130 C730 96 770 96 800 116" />
    <rect x="780" y="116" width="150" height="104" rx="10" fill="#fff" />
    <circle cx="804" cy="140" r="6" />
    <g stroke="none" fill="#009B9E">
      {[798, 822, 846, 870, 894].map((x) => <rect key={x} x={x} y="168" width="20" height="30" rx="2" />)}
    </g>
    <path d="M866 142 L878 152 L900 130" strokeWidth="3" />
  </g>,
  <g key="refinance" {...prop}>
    <path strokeDasharray="2 10" strokeWidth="3" d="M880 380 C950 200 800 26 480 22 C200 20 30 170 66 372" />
    <path strokeWidth="3" d="M52 356 L68 382 L88 360" />
  </g>,
];

/** A finished, static scene for one stage. Used when the steps are stacked. */
export function Scene({ index }: { index: number }) {
  const stage = STAGES[index] ?? STAGES[0];
  return (
    <svg viewBox="20 20 920 384" className="h-auto w-full" aria-hidden="true" focusable="false" style={inks[stage.owner]}>
      {PROPS[index]}
      <line x1="20" y1="397" x2="940" y2="397" stroke="var(--color-forest)" strokeWidth="3" />
      <use href="#ev" transform="translate(160 40)" />
      <PackCells filled={index + 1} />
    </svg>
  );
}
