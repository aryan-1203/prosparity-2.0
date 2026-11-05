import localFont from "next/font/local";

export const sans = localFont({
  src: "./prosparity-sans.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-sans",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
});

export const devanagari = localFont({
  src: "./prosparity-sans-devanagari.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-deva",
  preload: false,
  declarations: [
    { prop: "unicode-range", value: "U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF" },
  ],
});
