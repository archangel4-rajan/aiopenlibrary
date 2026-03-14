import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the createAdminClient pattern — ensures public-read functions
 * use the admin (service role) client rather than the user-scoped client,
 * so RLS doesn't filter out results for logged-in users.
 */

const mockUserFrom = vi.fn();
const mockAdminFrom = vi.fn();

// Chain builder matching db.test.ts pattern
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
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockUserFrom(...args),
  }),
  createAdminClient: vi.fn().mockReturnValue({
    from: (...args: unknown[]) => mockAdminFrom(...args),
  }),
}));

import {
  getCategories,
  getPrompts,
  getPromptBySlug,
  getUserProfile,
  getCreatorByUsername,
  getPublishedPacks,
  getPublishedChains,
  getAllPromptsAdmin,
  isPromptSavedByUser,
} from "@/lib/db";

describe("Admin vs User client usage", () => {
  it("getCategories uses admin client, not user client", async () => {
    mockAdminFrom.mockReturnValue(createChain([]));
    await getCategories();
    expect(mockAdminFrom).toHaveBeenCalledWith("categories");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getPrompts uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain([]));
    await getPrompts();
    expect(mockAdminFrom).toHaveBeenCalledWith("prompts");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getPromptBySlug uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain(null, { message: "not found" }));
    await getPromptBySlug("test");
    expect(mockAdminFrom).toHaveBeenCalledWith("prompts");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getUserProfile uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain(null, { message: "not found" }));
    await getUserProfile("user-1");
    expect(mockAdminFrom).toHaveBeenCalledWith("profiles");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getCreatorByUsername uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain(null, { message: "not found" }));
    await getCreatorByUsername("testuser");
    expect(mockAdminFrom).toHaveBeenCalledWith("profiles");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getPublishedPacks uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain([]));
    await getPublishedPacks();
    expect(mockAdminFrom).toHaveBeenCalledWith("prompt_packs");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getPublishedChains uses admin client", async () => {
    mockAdminFrom.mockReturnValue(createChain([]));
    await getPublishedChains();
    expect(mockAdminFrom).toHaveBeenCalledWith("prompt_chains");
    expect(mockUserFrom).not.toHaveBeenCalled();
  });

  it("getAllPromptsAdmin uses user client (RLS-scoped)", async () => {
    mockUserFrom.mockReturnValue(createChain([]));
    await getAllPromptsAdmin();
    expect(mockUserFrom).toHaveBeenCalledWith("prompts");
    // Admin queries still go through user client with admin RLS
  });

  it("isPromptSavedByUser uses user client (RLS-scoped)", async () => {
    mockUserFrom.mockReturnValue(createChain(null));
    await isPromptSavedByUser("prompt-1", "user-1");
    expect(mockUserFrom).toHaveBeenCalledWith("saved_prompts");
  });
});
