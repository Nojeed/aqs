import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { jakarta, plexArabic } from "./fonts";

export const metadata: Metadata = { title: "404 | AQS" };

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={`${plexArabic.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh items-center justify-center bg-brand-950 p-6 text-center text-white">
        <div>
          <p className="font-display text-7xl font-extrabold text-white/20">404</p>
          <h1 className="mt-4 text-2xl font-bold text-white">الصفحة غير موجودة · Page not found</h1>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/ar" className="btn-light">
              الرئيسية
            </Link>
            <Link href="/en" className="btn-ghost-light">
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
