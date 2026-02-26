import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockPromptSingle = vi.fn();
const mockPurchaseCheck = vi.fn();
const mockBalanceSingle = vi.fn();
const mockRpc = vi.fn();

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

import { POST } from "@/app/api/prompts/[id]/purchase/route";

const paramsPromise = Promise.resolve({ id: "prompt-1" });

function makeRequest() {
  return new Request("http://localhost/api/prompts/prompt-1/purchase", {
    method: "POST",
  });
}

describe("POST /api/prompts/[id]/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(401);
  });

  it("returns 404 when prompt not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(404);
  });

  it("returns 400 when prompt is not premium", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: false, zap_price: null, created_by: "creator-1" },
      error: null,
    });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(400);
  });

  it("returns 400 when prompt has no price", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: true, zap_price: 0, created_by: "creator-1" },
      error: null,
    });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(400);
  });

  it("returns 409 when already purchased", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: true, zap_price: 50, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: { id: "purchase-1" } });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(409);
  });

  it("returns 402 when insufficient balance", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: true, zap_price: 50, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 10 } });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.balance).toBe(10);
    expect(data.required).toBe(50);
  });

  it("succeeds when balance is sufficient", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: true, zap_price: 50, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 100 } });
    mockRpc.mockResolvedValue({ data: "tx-123", error: null });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.transaction_id).toBe("tx-123");
  });

  it("returns 500 when RPC fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { id: "prompt-1", is_premium: true, zap_price: 50, created_by: "creator-1" },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 100 } });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC failed" } });
    const response = await POST(makeRequest(), { params: paramsPromise });
    expect(response.status).toBe(500);
  });
});
