import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  // 300 was never used; fewer font files means text paints sooner on slow phones.
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  // Only display headings use Jakarta (body Latin text uses Plex Arabic's own Latin letters).
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
