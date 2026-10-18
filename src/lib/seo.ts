import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

/** Public base URL, used for absolute links in metadata, the sitemap and robots.txt. */
export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

const fallbackImage = { url: "/brand/banner.png", width: 960, height: 400 };

/**
 * Complete metadata for a public page. Next merges metadata shallowly, so a page that sets
 * `openGraph` would otherwise drop the site name, locale and default image from the layout.
 * `path` is the part after the locale, e.g. "/courses/haccp-level-3" or "" for home.
 */
export async function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Promise<Metadata> {
  const site = await getSite();
  const url = `/${locale}${path}`;
  const images = image ? [{ url: image }] : [fallbackImage];
  const ogTitle = title ? `${title} | ${site.brand.name}` : t(site.seo.title, locale);
  const desc = description || t(site.seo.description, locale);
  return {
    ...(title && { title }),
    description: desc,
    alternates: {
      canonical: url,
      languages: { ar: `/ar${path}`, en: `/en${path}`, "x-default": `/ar${path}` },
    },
    openGraph: {
      title: ogTitle,
      description: desc,
      url,
      siteName: t(site.brand.fullName, locale),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
      type,
      images,
      ...(publishedTime && { publishedTime }),
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: desc, images: images.map((i) => i.url) },
  };
}
