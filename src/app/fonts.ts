import type { CSSProperties } from "react";
import { Inter, Noto_Sans_Arabic } from "next/font/google";

// Close free stand-ins for Apple's SF Pro and SF Arabic, which may not be embedded on websites.
// Both are variable fonts: one file covers every weight.
const inter = Inter({ subsets: ["latin"], display: "swap" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic", display: "swap" });

/** Spread on <html>. --font-inter is Inter's own family name only: Next always adds an Arial-based
 * "Inter Fallback", and Arial has Arabic letters, so it would catch Arabic text before Noto. */
export const fonts = {
  className: notoArabic.variable,
  style: { "--font-inter": inter.style.fontFamily.split(",")[0] } as CSSProperties,
};
