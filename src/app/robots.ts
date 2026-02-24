import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/auth", "/profile", "/api"],
      },
    ],
    sitemap: "https://aiopenlibrary.com/sitemap.xml",
  };
}
