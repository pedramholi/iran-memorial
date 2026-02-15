import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/admin/", "/admin", "/fa/admin", "/en/admin", "/de/admin"],
      },
    ],
    sitemap: "https://memorial.n8ncloud.de/sitemap.xml",
  };
}
