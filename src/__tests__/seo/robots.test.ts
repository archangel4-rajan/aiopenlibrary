import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots.ts", () => {
  const result = robots();
  // rules is always an array in our implementation
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function findRule(userAgent: string): any {
    return (rules as Array<Record<string, unknown>>).find(
      (r) => r.userAgent === userAgent
    );
  }

  it("includes sitemap URL", () => {
    expect(result.sitemap).toBe("https://aiopenlibrary.com/sitemap.xml");
  });

  it("allows Googlebot with correct disallows", () => {
    const googlebot = findRule("Googlebot");
    expect(googlebot).toBeDefined();
    expect(googlebot.allow).toBe("/");
    expect(googlebot.disallow).toContain("/auth");
    expect(googlebot.disallow).toContain("/admin");
    expect(googlebot.disallow).toContain("/creator");
    expect(googlebot.disallow).toContain("/api");
  });

  it("blocks AI training crawlers", () => {
    const blockedBots = [
      "GPTBot", "CCBot", "Google-Extended", "ClaudeBot",
      "Bytespider", "ChatGPT-User", "anthropic-ai",
      "Applebot-Extended", "FacebookBot", "cohere-ai",
    ];
    for (const bot of blockedBots) {
      const rule = findRule(bot);
      expect(rule, `Expected rule for ${bot}`).toBeDefined();
      expect(rule.disallow).toBe("/");
    }
  });

  it("has a wildcard fallback rule", () => {
    const wildcard = findRule("*");
    expect(wildcard).toBeDefined();
    expect(wildcard.allow).toBe("/");
    expect(wildcard.crawlDelay).toBe(10);
    expect(wildcard.disallow).toContain("/creator");
  });
});
