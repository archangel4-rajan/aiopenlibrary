import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockRpc = vi.fn();

// Chain builder for fluent Supabase API
function createChain(finalData: unknown = [], finalError: unknown = null) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select",
    "insert",
    "delete",
    "update",
    "eq",
    "in",
    "or",
    "order",
    "limit",
    "neq",
  ];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain["single"] = vi.fn().mockResolvedValue({ data: finalData, error: finalError });
  chain["maybeSingle"] = vi.fn().mockResolvedValue({ data: finalData, error: finalError });

  // Override select to also support count mode
  (chain["select"] as ReturnType<typeof vi.fn>).mockImplementation(
    (_cols?: string, opts?: { count?: string; head?: boolean }) => {
      if (opts?.head) {
        // Return a count-style result at chain end
        const countChain = { ...chain };
        countChain["eq"] = vi.fn().mockResolvedValue({
          count: Array.isArray(finalData) ? finalData.length : 0,
          error: finalError,
        });
        return countChain;
      }
      return chain;
    }
  );

  // Make the chain itself thenable for non-single queries
  (chain as Record<string, unknown>)["then"] = (
    resolve: (value: unknown) => unknown
  ) => resolve({ data: finalData, error: finalError });

  return chain;
}

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

import {
  getCategories,
  getCategoryBySlug,
  getPrompts,
  getPromptBySlug,
  getPromptById,
  getFeaturedPrompts,
  searchPrompts,
  getAllPromptsAdmin,
  isPromptSavedByUser,
  getUserSavedPromptIds,
  getUserVote,
  getUserVotedPromptIds,
  getLeaderboardPrompts,
  getUserProfile,
} from "@/lib/db";

const sampleCategory = {
  id: "cat-1",
  name: "Software Engineering",
  slug: "software-engineering",
  icon: "💻",
  description: "Coding prompts",
  created_at: "2025-01-01T00:00:00Z",
};

const samplePrompt = {
  id: "prompt-1",
  slug: "test-prompt",
  title: "Test Prompt",
  description: "A test prompt",
  category_id: "cat-1",
  category_name: "Software Engineering",
  category_slug: "software-engineering",
  prompt: "Test prompt text",
  tags: ["test"],
  recommended_model: "Claude Opus 4",
  model_icon: "anthropic",
  use_cases: ["Testing"],
  example_output: null,
  output_screenshots: null,
  references: [],
  variables: [],
  tips: null,
  difficulty: "Intermediate",
  saves_count: 100,
  likes_count: 10,
  dislikes_count: 2,
  is_published: true,
  created_by: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("Database functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("returns categories from Supabase", async () => {
      mockFrom.mockReturnValue(createChain([sampleCategory]));
      const categories = await getCategories();
      expect(categories).toEqual([sampleCategory]);
      expect(mockFrom).toHaveBeenCalledWith("categories");
    });

    it("returns empty array on error", async () => {
      mockFrom.mockReturnValue(createChain(null, { message: "error" }));
      const categories = await getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe("getCategoryBySlug", () => {
    it("returns a category by slug", async () => {
      const chain = createChain(sampleCategory);
      mockFrom.mockReturnValue(chain);
      const cat = await getCategoryBySlug("software-engineering");
      expect(cat).toEqual(sampleCategory);
    });

    it("returns null on error", async () => {
      const chain = createChain(null, { message: "not found" });
      mockFrom.mockReturnValue(chain);
      const cat = await getCategoryBySlug("nonexistent");
      expect(cat).toBeNull();
    });
  });

  describe("getPrompts", () => {
    it("returns prompts from Supabase", async () => {
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const prompts = await getPrompts();
      expect(prompts).toEqual([samplePrompt]);
    });

    it("returns empty array on error", async () => {
      mockFrom.mockReturnValue(createChain(null, { message: "error" }));
      const prompts = await getPrompts();
      expect(prompts).toEqual([]);
    });
  });

  describe("getPromptBySlug", () => {
    it("returns a prompt by slug", async () => {
      const chain = createChain(samplePrompt);
      mockFrom.mockReturnValue(chain);
      const prompt = await getPromptBySlug("test-prompt");
      expect(prompt).toEqual(samplePrompt);
    });

    it("returns null for missing slug", async () => {
      const chain = createChain(null, { message: "not found" });
      mockFrom.mockReturnValue(chain);
      const prompt = await getPromptBySlug("missing");
      expect(prompt).toBeNull();
    });
  });

  describe("getPromptById", () => {
    it("returns a prompt by id", async () => {
      const chain = createChain(samplePrompt);
      mockFrom.mockReturnValue(chain);
      const prompt = await getPromptById("prompt-1");
      expect(prompt).toEqual(samplePrompt);
    });
  });

  describe("getFeaturedPrompts", () => {
    it("returns prompts from Supabase", async () => {
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const featured = await getFeaturedPrompts(6);
      expect(featured).toEqual([samplePrompt]);
    });
  });

  describe("searchPrompts", () => {
    it("returns all prompts for empty query", async () => {
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const results = await searchPrompts("");
      expect(results).toEqual([samplePrompt]);
    });

    it("searches with non-empty query", async () => {
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const results = await searchPrompts("test");
      expect(results).toEqual([samplePrompt]);
    });
  });

  describe("isPromptSavedByUser", () => {
    it("returns true when saved", async () => {
      const chain = createChain({ id: "save-1" });
      mockFrom.mockReturnValue(chain);
      const saved = await isPromptSavedByUser("prompt-1", "user-1");
      expect(saved).toBe(true);
    });

    it("returns false when not saved", async () => {
      const chain = createChain(null);
      mockFrom.mockReturnValue(chain);
      const saved = await isPromptSavedByUser("prompt-1", "user-1");
      expect(saved).toBe(false);
    });
  });

  describe("getUserSavedPromptIds", () => {
    it("returns array of prompt IDs", async () => {
      mockFrom.mockReturnValue(
        createChain([{ prompt_id: "p1" }, { prompt_id: "p2" }])
      );
      const ids = await getUserSavedPromptIds("user-1");
      expect(ids).toEqual(["p1", "p2"]);
    });

    it("returns empty array on error", async () => {
      mockFrom.mockReturnValue(createChain(null, { message: "error" }));
      const ids = await getUserSavedPromptIds("user-1");
      expect(ids).toEqual([]);
    });
  });

  describe("getUserVote", () => {
    it("returns vote when exists", async () => {
      const vote = {
        id: "v1",
        user_id: "user-1",
        prompt_id: "prompt-1",
        vote_type: "like",
        created_at: "2025-01-01",
      };
      const chain = createChain(vote);
      mockFrom.mockReturnValue(chain);
      const result = await getUserVote("prompt-1", "user-1");
      expect(result).toEqual(vote);
    });

    it("returns null when no vote", async () => {
      const chain = createChain(null);
      mockFrom.mockReturnValue(chain);
      const result = await getUserVote("prompt-1", "user-1");
      expect(result).toBeNull();
    });
  });

  describe("getUserVotedPromptIds", () => {
    it("returns vote map", async () => {
      mockFrom.mockReturnValue(
        createChain([
          { prompt_id: "p1", vote_type: "like" },
          { prompt_id: "p2", vote_type: "dislike" },
        ])
      );
      const votes = await getUserVotedPromptIds("user-1");
      expect(votes).toEqual({ p1: "like", p2: "dislike" });
    });

    it("returns empty object on error", async () => {
      mockFrom.mockReturnValue(createChain(null, { message: "error" }));
      const votes = await getUserVotedPromptIds("user-1");
      expect(votes).toEqual({});
    });
  });

  describe("getLeaderboardPrompts", () => {
    it("falls back to top prompts when rpc returns empty", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const result = await getLeaderboardPrompts(10);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("weekly_saves");
    });
  });

  describe("getUserProfile", () => {
    it("returns profile by ID", async () => {
      const profile = {
        id: "user-1",
        email: "test@test.com",
        display_name: "Test",
        avatar_url: null,
        role: "user",
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      };
      const chain = createChain(profile);
      mockFrom.mockReturnValue(chain);
      const result = await getUserProfile("user-1");
      expect(result).toEqual(profile);
    });

    it("returns null on error", async () => {
      const chain = createChain(null, { message: "error" });
      mockFrom.mockReturnValue(chain);
      const result = await getUserProfile("user-1");
      expect(result).toBeNull();
    });
  });

  describe("getAllPromptsAdmin", () => {
    it("returns all prompts including unpublished", async () => {
      mockFrom.mockReturnValue(createChain([samplePrompt]));
      const prompts = await getAllPromptsAdmin();
      expect(prompts).toEqual([samplePrompt]);
    });
  });
});
