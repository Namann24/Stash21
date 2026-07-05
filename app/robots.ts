import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stash21.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/dashboard"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
