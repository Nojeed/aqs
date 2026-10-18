import type { MetadataRoute } from "next";
import { getCourses, getPosts, getServices } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/** Every public page in both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, courses, posts] = await Promise.all([getServices(), getCourses(), getPosts()]);
  const paths = [
    "",
    "/services",
    "/courses",
    "/blog",
    "/contact",
    "/verify",
    ...services.map((s) => `/services/${s.slug}`),
    ...courses.map((c) => `/courses/${c.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  return paths.flatMap((path) =>
    (["ar", "en"] as const).map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: { languages: { ar: `${siteUrl}/ar${path}`, en: `${siteUrl}/en${path}` } },
    })),
  );
}
