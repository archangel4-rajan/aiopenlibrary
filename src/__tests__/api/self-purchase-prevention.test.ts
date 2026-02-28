import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Dedicated test file for self-purchase prevention across all purchasable entities.
 * Each entity (prompt, chain, pack) prevents the creator from buying their own content.
 */

// ──────────────────────────────────────────────
// Prompt purchase mocks
// ──────────────────────────────────────────────

const mockGetUser = vi.fn();
const mockPromptSingle = vi.fn();
const mockChainSingle = vi.fn();
const mockPurchaseCheck = vi.fn();
const mockBalanceSingle = vi.fn();
const mockRpc = vi.fn();
const mockGetPackById = vi.fn();
const mockEnsureZapBalance = vi.fn();
const mockGetChainBySlug = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "prompts") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockPromptSingle(),
            }),
          }),
        };
      }
      if (table === "prompt_chains") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockChainSingle(),
            }),
          }),
        };
      }
      if (table === "user_purchases") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => mockPurchaseCheck(),
              }),
            }),
          }),
        };
      }
      if (table === "zap_balances") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockBalanceSingle(),
            }),
          }),
        };
      }
      return {};
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

vi.mock("@/lib/db", () => ({
  getPackById: (...args: unknown[]) => mockGetPackById(...args),
  ensureZapBalance: (...args: unknown[]) => mockEnsureZapBalance(...args),
  getChainBySlug: (...args: unknown[]) => mockGetChainBySlug(...args),
}));

import { POST as PromptPurchase } from "@/app/api/prompts/[id]/purchase/route";
import { POST as ChainPurchase } from "@/app/api/chains/[slug]/purchase/route";
import { POST as PackPurchase } from "@/app/api/packs/[param]/purchase/route";

describe("Self-purchase prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureZapBalance.mockResolvedValue(undefined);
  });

  it("Prompt: returns 400 when creator buys own prompt", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "p1", is_premium: true, zap_price: 50, created_by: "creator-1" },
      error: null,
    });
    const request = new Request("http://localhost/api/prompts/p1/purchase", { method: "POST" });
    const response = await PromptPurchase(request, { params: Promise.resolve({ id: "p1" }) });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("own prompt");
  });

  it("Chain: returns 400 when creator buys own chain", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockGetChainBySlug.mockResolvedValue({
      id: "c1",
      slug: "test-chain",
      is_premium: true,
      zap_price: 100,
      created_by: "creator-1",
    });
    const request = new Request("http://localhost/api/chains/test-chain/purchase", { method: "POST" });
    const response = await ChainPurchase(request, { params: Promise.resolve({ slug: "test-chain" }) });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("own chain");
  });

  it("Pack: returns 400 when creator buys own pack", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockGetPackById.mockResolvedValue({
      id: "pack-1",
      is_published: true,
      creator_id: "creator-1",
      zap_price: 100,
    });
    const request = new Request("http://localhost/api/packs/pack-1/purchase", { method: "POST" });
    const response = await PackPurchase(request, { params: Promise.resolve({ param: "pack-1" }) });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("own pack");
  });
});
