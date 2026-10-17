import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import "../globals.css";
import { jakarta, plexArabic } from "../fonts";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MotionProvider } from "@/components/site/motion-provider";
import { getSite, getYear } from "@/lib/content";
import { dir, getDictionary, isLocale, locales, t } from "@/lib/i18n";

export async function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!isLocale(locale)) return {};
  const site = await getSite();
  const title = t(site.seo.title, locale);
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: { default: title, template: `%s | ${site.brand.name}` },
    description: t(site.seo.description, locale),
    alternates: { languages: { ar: "/ar", en: "/en" } },
    openGraph: {
      title,
      description: t(site.seo.description, locale),
      siteName: t(site.brand.fullName, locale),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      images: [{ url: "/brand/banner.png", width: 960, height: 400 }],
    },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  const [site, year] = await Promise.all([getSite(), getYear()]);
  const d = getDictionary(locale);
  const nav = [
    { href: `/${locale}`, label: d.nav.home },
    { href: `/${locale}/services`, label: d.nav.services },
    { href: `/${locale}/courses`, label: d.nav.courses },
    { href: `/${locale}/blog`, label: d.nav.blog },
    { href: `/${locale}/contact`, label: d.nav.contact },
  ];

  return (
    <html lang={locale} dir={dir(locale)} className={`${plexArabic.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-white px-4 py-2 text-brand-900 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
        </a>
        <Header
          locale={locale}
          nav={nav}
          brand={site.brand.name}
          tagline={t(site.brand.fullName, "en")}
          verifyLabel={d.nav.verify}
          languageLabel={d.common.language}
          menuLabel={d.common.menu}
          closeLabel={d.common.close}
        />
        <main id="main" className="flex-1">
          <MotionProvider>{children}</MotionProvider>
        </main>
        <Footer locale={locale} site={site} year={year} />
      </body>
    </html>
  );
}
