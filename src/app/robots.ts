import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // /api/og stays open: X, LinkedIn and Slack read robots.txt before fetching a link-preview image.
    rules: { userAgent: "*", allow: ["/", "/api/og"], disallow: ["/admin", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
