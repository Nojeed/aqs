import type { Metadata } from "next";
import "../globals.css";
import { fonts } from "../fonts";

export const metadata: Metadata = {
  title: { default: "AQS Admin", template: "%s · AQS Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" className={fonts.className} style={fonts.style}>
      <body className="min-h-dvh bg-slate-50 text-slate-700">{children}</body>
    </html>
  );
}
