import { getTranslations } from "next-intl/server";
import { Icon } from "../ui/icon";
import { BHOPAL, CENTRES, MAP_HEIGHT, MAP_WIDTH, statePaths } from "./india-paths";
import { MapController } from "./map-controller";

const OPERATING: Record<string, "mp" | "up" | "cg"> = { "Madhya Pradesh": "mp", "Uttar Pradesh": "up", Chhattisgarh: "cg" };
const ORDER = ["mp", "up", "cg"] as const;

export async function IndiaMap() {
  const t = await getTranslations("map");
  const live = statePaths.filter(([name]) => OPERATING[name]);
  return (
    <MapController>
      <div className="grid-site gap-y-8">
        <div className="relative col-span-4 md:col-span-8 lg:col-span-6">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={t("alt")} className="mx-auto h-auto w-full max-w-[560px]">
            {statePaths.map(([name, d]) => !OPERATING[name] && <path key={name} d={d} fill="#DDF9E7" stroke="#7FB89C" strokeWidth="0.9" strokeLinejoin="round" />)}
            {live.map(([name, d]) => {
              const key = OPERATING[name];
              return (
                <g key={name} data-state={key} className="cursor-pointer">
                  <path d={d} fill="#5DBE93" stroke="#004737" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d={d} data-overlay={key} className="map-overlay" fill="#004737" stroke="#004737" strokeWidth="1.2" strokeLinejoin="round" />
                </g>
              );
            })}
            <circle cx={BHOPAL.x} cy={BHOPAL.y} r="10" fill="#fff" opacity="0.55" pointerEvents="none" />
            <circle cx={BHOPAL.x} cy={BHOPAL.y} r="4.5" fill="#fff" stroke="#004737" strokeWidth="2" pointerEvents="none" />
          </svg>
          {ORDER.map((key) => (
            <span key={key} data-label={key} className="map-label t-small pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-tag bg-white px-2 py-1 font-[540] text-forest" style={{ left: `${CENTRES[key].x}%`, top: `${CENTRES[key].y}%` }}>
              {t(`states.${key}.name`)}
            </span>
          ))}
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:self-center">
          <p className="t-small text-slate">{t("hint")}</p>
          <ul className="mt-3 space-y-2">
            {ORDER.map((key) => (
              <li key={key}>
                <button type="button" data-state={key} data-row={key} className="map-row block w-full rounded-control bg-white p-4 text-left">
                  <span className="flex items-center gap-2 font-[540] text-forest"><Icon name="MapPin" />{t(`states.${key}.name`)}</span>
                  <span className="mt-1 block">{t(`states.${key}.text`)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="t-small mt-3 text-slate">{t("pin")}</p>
        </div>
      </div>
    </MapController>
  );
}
