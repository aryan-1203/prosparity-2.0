import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EvDefs } from "../home/ev-art";
import { ProductArt } from "./art";

export async function ProductGrid({ defs = true }: { defs?: boolean }) {
  const t = await getTranslations("products");
  const l = await getTranslations("pages.productLabels");
  const items = [
    ...(["electric-2-wheeler", "electric-3-wheeler", "l5-cargo", "dealer-financing"] as const).map((slug) => ({ slug, name: t(`${slug}.name`), text: t(`${slug}.lead`), href: `/products/${slug}` })),
    { slug: "battery", name: l("batteryName"), text: l("batteryText"), href: "/apply" },
  ];
  return (
    <>
      {defs && <EvDefs />}
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug} className={`product-card relative overflow-hidden rounded-panel bg-mint ${item.slug === "battery" ? "md:col-span-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center" : ""}`}>
            <div className="flex justify-center px-6 pt-6">
              <ProductArt slug={item.slug} className="product-art h-auto w-full max-w-sm" />
            </div>
            <div className="m-2 rounded-control bg-white p-5">
              <h3 className="t-subhead text-forest"><Link href={item.href} prefetch={false} className="after:absolute after:inset-0">{item.name}</Link></h3>
              <p className="mt-1 text-slate">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
