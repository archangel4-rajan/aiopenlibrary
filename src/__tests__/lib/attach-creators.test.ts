import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the attachCreators batch helper in db.ts.
 * This replaced the broken FK join (profiles!prompts_created_by_fkey)
 * with a two-step approach: fetch prompts, then batch-fetch creator profiles.
 */

const mockAdminFrom = vi.fn();

function createChain(finalData: unknown = [], finalError: unknown = null) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "delete", "update", "eq", "in", "or", "order", "limit", "neq", "not", "overlaps"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain["single"] = vi.fn().mockResolvedValue({ data: finalData, error: finalError });
  chain["maybeSingle"] = vi.fn().mockResolvedValue({ data: finalData, error: finalError });
  (chain as Record<string, unknown>)["then"] = (resolve: (value: unknown) => unknown) =>
    resolve({ data: finalData, error: finalError });
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ from: vi.fn() }),
  createAdminClient: vi.fn().mockReturnValue({
    from: (...args: unknown[]) => mockAdminFrom(...args),
  }),
}));

import { getFeaturedPrompts, getRecentPrompts, getPromptsByCategory } from "@/lib/db";

const basePrompt = {
  id: "p1",
  slug: "test",
  title: "Test",
  description: "desc",
  category_id: "c1",
  category_name: "Code",
  category_slug: "code",
  prompt: "text",
  tags: [],
  recommended_model: "Claude",
  model_icon: "anthropic",
  use_cases: [],
  example_output: null,
  output_screenshots: null,
  references: [],
  variables: [],
  tips: null,
  difficulty: "Beginner",
  saves_count: 5,
  likes_count: 1,
  dislikes_count: 0,
  is_published: true,
  created_at: "2025-01-01",
  updated_at: "2025-01-01",
};

describe("attachCreators batch helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches creator info when created_by is set", async () => {
    const promptWithCreator = { ...basePrompt, created_by: "user-123" };
    const creatorProfile = { id: "user-123", display_name: "Jane Doe", username: "janedoe" };

    // First call: prompts query; second call: profiles query
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === "prompts" || callCount === 1) {
        return createChain([promptWithCreator]);
      }
      if (table === "profiles") {
        return createChain([creatorProfile]);
      }
      return createChain([]);
    });

    const result = await getFeaturedPrompts(6);
    expect(result).toHaveLength(1);
    expect(result[0].creator).toEqual({ display_name: "Jane Doe", username: "janedoe" });
  });

  it("sets creator to null when created_by is null", async () => {
    const promptNoCreator = { ...basePrompt, created_by: null };
    mockAdminFrom.mockReturnValue(createChain([promptNoCreator]));

    const result = await getFeaturedPrompts(6);
    expect(result).toHaveLength(1);
    expect(result[0].creator).toBeNull();
  });

  it("handles empty prompt list gracefully", async () => {
    mockAdminFrom.mockReturnValue(createChain([]));
    const result = await getFeaturedPrompts(6);
    expect(result).toEqual([]);
  });

  it("sets creator to null when profile not found for created_by", async () => {
    const promptOrphan = { ...basePrompt, created_by: "deleted-user" };

    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === "prompts" || callCount === 1) {
        return createChain([promptOrphan]);
      }
      if (table === "profiles") {
        // No matching profile found
        return createChain([]);
      }
      return createChain([]);
    });

    const result = await getFeaturedPrompts(6);
    expect(result).toHaveLength(1);
    expect(result[0].creator).toBeNull();
  });

  it("deduplicates creator IDs for batch query", async () => {
    const p1 = { ...basePrompt, id: "p1", created_by: "user-1" };
    const p2 = { ...basePrompt, id: "p2", created_by: "user-1" };
    const creatorProfile = { id: "user-1", display_name: "Shared Creator", username: "shared" };

    let profilesChain: ReturnType<typeof createChain> | null = null;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        profilesChain = createChain([creatorProfile]);
        return profilesChain;
      }
      return createChain([p1, p2]);
    });

    const result = await getFeaturedPrompts(6);
    expect(result).toHaveLength(2);
    expect(result[0].creator).toEqual({ display_name: "Shared Creator", username: "shared" });
    expect(result[1].creator).toEqual({ display_name: "Shared Creator", username: "shared" });
  });
});
