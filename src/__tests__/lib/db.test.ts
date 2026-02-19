import { describe, it, expect, vi } from "vitest";

// Mock Supabase as not configured to test fallback mode
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  isSupabaseConfigured: () => false,
}));

// Import after mocking
import {
  getCategories,
  getCategoryBySlug,
  getPrompts,
  getPromptBySlug,
  getFeaturedPrompts,
  searchPrompts,
  getPromptsCount,
  getCategoryPromptCounts,
  getLeaderboardPrompts,
} from "@/lib/db";

describe("Database functions (fallback mode)", () => {
  describe("getCategories", () => {
    it("returns all categories", async () => {
      const categories = await getCategories();
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty("name");
      expect(categories[0]).toHaveProperty("slug");
      expect(categories[0]).toHaveProperty("icon");
    });
  });

  describe("getCategoryBySlug", () => {
    it("returns a category when slug matches", async () => {
      const cat = await getCategoryBySlug("software-engineering");
      expect(cat).not.toBeNull();
      expect(cat?.name).toBe("Software Engineering");
    });

    it("returns null for nonexistent slug", async () => {
      const cat = await getCategoryBySlug("nonexistent-category");
      expect(cat).toBeNull();
    });
  });

  describe("getPrompts", () => {
    it("returns all prompts sorted by saves_count descending", async () => {
      const prompts = await getPrompts();
      expect(prompts.length).toBeGreaterThan(0);

      // Check sorting
      for (let i = 1; i < prompts.length; i++) {
        expect(prompts[i - 1].saves_count).toBeGreaterThanOrEqual(
          prompts[i].saves_count
        );
      }
    });

    it("prompts have all required fields", async () => {
      const prompts = await getPrompts();
      const prompt = prompts[0];
      expect(prompt).toHaveProperty("id");
      expect(prompt).toHaveProperty("slug");
      expect(prompt).toHaveProperty("title");
      expect(prompt).toHaveProperty("description");
      expect(prompt).toHaveProperty("category_name");
      expect(prompt).toHaveProperty("category_slug");
      expect(prompt).toHaveProperty("prompt");
      expect(prompt).toHaveProperty("tags");
      expect(prompt).toHaveProperty("saves_count");
      expect(prompt).toHaveProperty("difficulty");
    });
  });

  describe("getPromptBySlug", () => {
    it("returns prompt for valid slug", async () => {
      const prompts = await getPrompts();
      const slug = prompts[0].slug;
      const prompt = await getPromptBySlug(slug);
      expect(prompt).not.toBeNull();
      expect(prompt?.slug).toBe(slug);
    });

    it("returns null for invalid slug", async () => {
      const prompt = await getPromptBySlug("this-does-not-exist");
      expect(prompt).toBeNull();
    });
  });

  describe("getFeaturedPrompts", () => {
    it("returns the specified number of prompts", async () => {
      const featured = await getFeaturedPrompts(3);
      expect(featured.length).toBe(3);
    });

    it("returns top prompts by saves_count", async () => {
      const featured = await getFeaturedPrompts(6);
      for (let i = 1; i < featured.length; i++) {
        expect(featured[i - 1].saves_count).toBeGreaterThanOrEqual(
          featured[i].saves_count
        );
      }
    });
  });

  describe("searchPrompts", () => {
    it("returns all prompts for empty query", async () => {
      const results = await searchPrompts("");
      const allPrompts = await getPrompts();
      expect(results.length).toBe(allPrompts.length);
    });

    it("filters by title", async () => {
      const results = await searchPrompts("code review");
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((p) =>
          p.title.toLowerCase().includes("code review")
        )
      ).toBe(true);
    });

    it("filters by category name", async () => {
      const results = await searchPrompts("Marketing");
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every(
          (p) =>
            p.title.toLowerCase().includes("marketing") ||
            p.description.toLowerCase().includes("marketing") ||
            p.category_name.toLowerCase().includes("marketing") ||
            p.tags.some((t) => t.toLowerCase().includes("marketing"))
        )
      ).toBe(true);
    });

    it("returns empty for no match", async () => {
      const results = await searchPrompts("xyznonexistent12345");
      expect(results.length).toBe(0);
    });
  });

  describe("getPromptsCount", () => {
    it("returns a positive number", async () => {
      const count = await getPromptsCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("getCategoryPromptCounts", () => {
    it("returns counts for categories", async () => {
      const counts = await getCategoryPromptCounts();
      expect(Object.keys(counts).length).toBeGreaterThan(0);
      expect(counts["software-engineering"]).toBeGreaterThan(0);
    });
  });

  describe("getLeaderboardPrompts", () => {
    it("returns prompts with weekly_saves field", async () => {
      const leaderboard = await getLeaderboardPrompts(10);
      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0]).toHaveProperty("weekly_saves");
    });

    it("respects the limit parameter", async () => {
      const leaderboard = await getLeaderboardPrompts(3);
      expect(leaderboard.length).toBe(3);
    });
  });
});
