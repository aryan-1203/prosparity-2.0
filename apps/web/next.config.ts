import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    const moved = [
      ["/dealers", "/products/dealer-financing"],
      ["/lending", "/products"],
      ["/lending-partners", "/partners"],
      ["/contact", "/support"],
      ["/news/battery-swap-startups-raise-capital", "/news"],
    ];
    return [
      ...moved.map(([from, to]) => ({ source: `/:locale(en|hi)${from}`, destination: `/:locale${to}`, permanent: false })),
      { source: "/:locale(en|hi)/battron", destination: "https://battron.in", permanent: false },
    ];
  },
};

export default withNextIntl(config);
