import { describe, it, expect } from "vitest";
import type { DbPrompt, DbCategory, DbProfile } from "@/lib/types";

describe("Type definitions", () => {
  it("DbPrompt interface has correct shape", () => {
    const prompt: DbPrompt = {
      id: "test-id",
      slug: "test-slug",
      title: "Test Title",
      description: "Test description",
      category_id: "cat-id",
      category_name: "Test Category",
      category_slug: "test-category",
      prompt: "Test prompt text",
      tags: ["tag1", "tag2"],
      recommended_model: "Claude Opus 4",
      model_icon: "anthropic",
      use_cases: ["use case 1"],
      example_output: null,
      output_screenshots: null,
      references: [{ title: "Ref", url: "https://example.com" }],
      variables: [{ name: "var1", description: "desc" }],
      tips: ["tip 1"],
      difficulty: "Intermediate",
      saves_count: 0,
      is_published: true,
      created_by: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(prompt.id).toBe("test-id");
    expect(prompt.difficulty).toBe("Intermediate");
    expect(prompt.references[0].title).toBe("Ref");
    expect(prompt.variables[0].name).toBe("var1");
  });

  it("DbCategory interface has correct shape", () => {
    const category: DbCategory = {
      id: "cat-id",
      name: "Test Category",
      slug: "test-category",
      icon: "💻",
      description: "A test category",
      created_at: "2024-01-01T00:00:00Z",
    };

    expect(category.slug).toBe("test-category");
    expect(category.icon).toBe("💻");
  });

  it("DbProfile interface has correct shape", () => {
    const profile: DbProfile = {
      id: "user-id",
      email: "test@example.com",
      display_name: "Test User",
      avatar_url: null,
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(profile.role).toBe("user");
    expect(profile.email).toBe("test@example.com");
  });

  it("DbProfile role can be admin", () => {
    const admin: DbProfile = {
      id: "admin-id",
      email: "admin@example.com",
      display_name: "Admin",
      avatar_url: "https://example.com/avatar.jpg",
      role: "admin",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(admin.role).toBe("admin");
  });

  it("DbPrompt difficulty accepts valid values", () => {
    const difficulties: Array<"Beginner" | "Intermediate" | "Advanced"> = [
      "Beginner",
      "Intermediate",
      "Advanced",
    ];

    for (const d of difficulties) {
      const prompt = { difficulty: d } as DbPrompt;
      expect(["Beginner", "Intermediate", "Advanced"]).toContain(
        prompt.difficulty
      );
    }
  });
});
