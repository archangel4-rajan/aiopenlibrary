import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/auth", "/admin", "/profile", "/api", "/creator"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/auth", "/admin", "/profile", "/api", "/creator"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        disallow: "/",
      },
      {
        userAgent: "FacebookBot",
        disallow: "/",
      },
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth", "/admin", "/profile", "/api", "/creator"],
        crawlDelay: 10,
      },
    ],
    sitemap: "https://aiopenlibrary.com/sitemap.xml",
  };
}
