import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockChainSingle = vi.fn();
const mockPurchaseCheck = vi.fn();
const mockBalanceSingle = vi.fn();
const mockRpc = vi.fn();
const mockSaveSelect = vi.fn();
const mockSaveInsert = vi.fn();
const mockSaveDelete = vi.fn();
const mockChainUpdate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "prompt_chains") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockChainSingle(),
            }),
          }),
          update: () => ({
            eq: () => mockChainUpdate(),
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
      if (table === "saved_chains") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => mockSaveSelect(),
              }),
            }),
          }),
          insert: () => ({
            error: null,
          }),
          delete: () => ({
            eq: () => ({
              eq: () => mockSaveDelete(),
            }),
          }),
        };
      }
      return {};
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

import { POST as PurchasePost } from "@/app/api/chains/[slug]/purchase/route";

const purchaseParams = Promise.resolve({ slug: "test-chain" });

function makePurchaseRequest() {
  return new Request("http://localhost/api/chains/test-chain/purchase", { method: "POST" });
}

describe("POST /api/chains/[slug]/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(401);
  });

  it("returns 404 when chain not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(404);
  });

  it("returns 400 when chain is not premium", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({
      data: { id: "c1", slug: "test-chain", is_premium: false, zap_price: null, created_by: "creator-1" },
      error: null,
    });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(400);
  });

  it("returns 409 when already purchased", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({
      data: { id: "c1", slug: "test-chain", is_premium: true, zap_price: 100, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: { id: "purchase-1" } });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(409);
  });

  it("returns 402 when insufficient balance", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({
      data: { id: "c1", slug: "test-chain", is_premium: true, zap_price: 100, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 50 } });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.balance).toBe(50);
    expect(data.required).toBe(100);
  });

  it("purchases chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({
      data: { id: "c1", slug: "test-chain", is_premium: true, zap_price: 100, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 200 } });
    mockRpc.mockResolvedValue({ data: "tx-1", error: null });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("returns 500 when RPC fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockChainSingle.mockResolvedValue({
      data: { id: "c1", slug: "test-chain", is_premium: true, zap_price: 100, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 200 } });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC failed" } });
    const response = await PurchasePost(makePurchaseRequest(), { params: purchaseParams });
    expect(response.status).toBe(500);
  });
});
