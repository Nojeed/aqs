import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

/** Public base URL, used for absolute links in metadata, the sitemap and robots.txt. */
export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
// Link previews, canonical links and the sitemap would all point at localhost.
if (!process.env.SITE_URL && process.env.NODE_ENV === "production") console.warn("SITE_URL is not set: link previews and canonical URLs will use http://localhost:3000.");

/** The 1200×630 link-preview image (see /api/og); external image URLs are used as they are. */
function previewImage(image: string | undefined, locale: Locale, alt: string) {
  if (image && /^https?:\/\//.test(image)) return { url: image, alt };
  const query = new URLSearchParams({ src: image || "/images/hero-food-plant.jpg", lang: locale });
  return { url: `/api/og?${query}`, width: 1200, height: 630, type: "image/jpeg", alt };
}

/** "https://x.com/aqs_training" → "@aqs_training", for twitter:site. */
function xHandle(url: string) {
  const name = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})\/?$/.exec(url.trim())?.[1];
  return name ? `@${name}` : undefined;
}

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
  const ogTitle = title ? `${title} | ${site.brand.name}` : t(site.seo.title, locale);
  const desc = description || t(site.seo.description, locale);
  const images = [previewImage(image, locale, title || t(site.brand.fullName, locale))];
  const xSite = xHandle(site.social.x);
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
    twitter: { card: "summary_large_image", title: ogTitle, description: desc, images, ...(xSite && { site: xSite }) },
  };
}
