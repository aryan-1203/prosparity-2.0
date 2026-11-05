import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { devanagari, sans } from "@/fonts";
import { routing } from "@/i18n/routing";
import "../globals.css";

interface Props { children: ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: t("homeTitle"), template: `%s | ${t("siteName")}` },
    description: t("homeDescription"),
    alternates: { canonical: `/${locale}`, languages: { en: "/en", hi: "/hi", "x-default": "/en" } },
    openGraph: { siteName: t("siteName"), type: "website", locale: locale === "hi" ? "hi_IN" : "en_IN" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sans.variable} ${devanagari.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={{}}>
          <a href="#main" className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50">{t("skip")}</a>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
