import type { CSSProperties, ReactNode } from "react";
import { inks } from "../home/ev-art";

const line = { fill: "none", stroke: "var(--v-ink)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const tint = { ...line, fill: "var(--v-tint)" };
const paper = { ...line, fill: "#fff" };

function Wheel({ cx, cy = 172, r = 30 }: { cx: number; cy?: number; r?: number }) {
  return (
    <g {...paper}>
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={r * 0.4} strokeWidth="2" />
    </g>
  );
}

function Cells({ x, y, w = 11, h = 14, gap = 4 }: { x: number; y: number; w?: number; h?: number; gap?: number }) {
  return (
    <g stroke="none">
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + i * (w + gap)} y={y} width={w} height={h} rx="2" fill={i === 0 || i === 4 ? "#004737" : "#009B9E"} />)}
    </g>
  );
}

const Road = () => <line x1="16" y1="203" x2="344" y2="203" {...line} />;

const scooter = (
  <>
    <Road />
    <path {...line} d="M238 58 L268 172" />
    <path {...line} strokeWidth="5" d="M214 40 L246 50" />
    <path {...line} d="M232 46 L238 60" />
    <path {...tint} d="M60 170 C54 132 84 106 124 104 L172 104 C184 104 188 112 188 122 L188 136 C188 144 194 150 202 150 L226 150 C236 150 240 144 242 134 L240 62 L252 104 C258 128 256 150 244 170 L210 170 C198 170 130 170 126 170 C124 146 100 134 80 142 C70 146 64 156 60 170 Z" />
    <path {...paper} d="M96 92 C96 84 102 80 110 80 L172 80 C182 80 186 88 182 96 L176 104 L100 104 C97 100 96 96 96 92 Z" />
    <circle {...paper} cx="250" cy="82" r="8" strokeWidth="2" />
    <rect {...paper} x="126" y="116" width="84" height="26" rx="4" strokeWidth="2" transform="translate(-8 0)" />
    <Cells x={125} y={122} />
    <Wheel cx={96} />
    <Wheel cx={268} />
  </>
);

const threeWheeler = (
  <g transform="translate(36 8) scale(0.47)">
    <line x1="-20" y1="357" x2="640" y2="357" {...line} strokeWidth="6" />
    <use href="#ev" strokeWidth="6" />
    <g transform="translate(0 0)"><Cells x={228} y={258} w={16} h={18} gap={4} /></g>
  </g>
);

const cargo = (
  <>
    <Road />
    <path {...line} d="M286 124 L302 172" />
    <path {...tint} d="M214 170 L214 70 C214 62 220 56 228 56 L272 56 C282 56 288 62 292 72 L308 118 C314 132 312 150 304 170 L268 170 C268 148 240 148 238 170 Z" />
    <path {...paper} strokeWidth="2" d="M232 72 L270 72 C276 72 278 76 280 80 L290 112 L232 112 Z" />
    <rect {...tint} x="24" y="62" width="182" height="96" rx="6" />
    <path {...line} strokeWidth="2" d="M24 90 H206 M84 62 V158 M146 62 V158" />
    <path {...line} d="M24 158 H214" />
    <rect {...paper} x="100" y="160" width="84" height="20" rx="4" strokeWidth="2" />
    <Cells x={106} y={163} w={12} h={14} gap={3} />
    <Wheel cx={62} />
    <Wheel cx={302} r={28} />
  </>
);

const dealer = (
  <>
    <Road />
    <path {...tint} d="M42 203 V92 H318 V203" />
    <path {...line} d="M28 92 L52 46 H308 L332 92" />
    <path {...paper} d="M28 92 C28 110 60 110 60 92 C60 110 92 110 92 92 C92 110 124 110 124 92 C124 110 156 110 156 92 C156 110 188 110 188 92 C188 110 220 110 220 92 C220 110 252 110 252 92 C252 110 284 110 284 92 C284 110 332 110 332 92 Z" />
    <rect {...paper} x="66" y="124" width="62" height="79" strokeWidth="2" />
    <circle cx="116" cy="166" r="3" fill="var(--v-ink)" stroke="none" />
    <rect {...paper} x="146" y="124" width="150" height="56" strokeWidth="2" />
    <path {...line} strokeWidth="2" d="M171 168 C171 156 182 148 196 148 L222 148 L232 160 L254 160 C262 160 268 164 270 168" />
    <circle {...paper} cx="184" cy="168" r="8" strokeWidth="2" />
    <circle {...paper} cx="258" cy="168" r="8" strokeWidth="2" />
  </>
);

const battery = (
  <>
    <rect {...tint} x="58" y="56" width="232" height="118" rx="12" />
    <rect {...tint} x="290" y="92" width="16" height="46" rx="4" />
    <rect {...paper} x="76" y="74" width="196" height="82" rx="6" strokeWidth="2" />
    <Cells x={88} y={88} w={30} h={54} gap={7} />
  </>
);

const art: Record<string, ReactNode> = {
  "electric-2-wheeler": scooter,
  "electric-3-wheeler": threeWheeler,
  "l5-cargo": cargo,
  "dealer-financing": dealer,
  battery,
};

/** Big line drawings in the same hand as the hero vehicle. Decorative, so hidden from screen readers. */
export function ProductArt({ slug, className = "h-auto w-full", style }: { slug: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 360 220" className={className} aria-hidden="true" focusable="false" style={{ ...inks.prosparity, ...style }}>
      {art[slug]}
    </svg>
  );
}
