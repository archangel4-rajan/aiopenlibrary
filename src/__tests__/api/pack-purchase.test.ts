import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockPurchaseCheck = vi.fn();
const mockBalanceSingle = vi.fn();
const mockRpc = vi.fn();
const mockGetPackById = vi.fn();
const mockEnsureZapBalance = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
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
}));

import { POST } from "@/app/api/packs/[param]/purchase/route";

function makeParams(param: string) {
  return { params: Promise.resolve({ param }) };
}

function makeRequest() {
  return new Request("http://localhost/api/packs/pack-1/purchase", { method: "POST" });
}

describe("POST /api/packs/[param]/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureZapBalance.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(401);
  });

  it("returns 404 when pack not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue(null);
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(404);
  });

  it("returns 404 when pack not published", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: false, creator_id: "creator-1", zap_price: 100 });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(404);
  });

  it("returns 400 when buying own pack (self-purchase prevention)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: true, creator_id: "creator-1", zap_price: 100 });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("own pack");
  });

  it("returns 409 when already purchased", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: true, creator_id: "creator-1", zap_price: 100 });
    mockPurchaseCheck.mockResolvedValue({ data: { id: "purchase-1" } });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(409);
  });

  it("returns 402 when insufficient balance", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: true, creator_id: "creator-1", zap_price: 100 });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 50 } });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.balance).toBe(50);
    expect(data.required).toBe(100);
  });

  it("purchases successfully via RPC", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: true, creator_id: "creator-1", zap_price: 100 });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 200 } });
    mockRpc.mockResolvedValue({ data: "tx-1", error: null });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.transaction_id).toBe("tx-1");
  });

  it("returns 500 when RPC fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetPackById.mockResolvedValue({ id: "pack-1", is_published: true, creator_id: "creator-1", zap_price: 100 });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    mockBalanceSingle.mockResolvedValue({ data: { balance: 200 } });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC failed" } });
    const response = await POST(makeRequest(), makeParams("pack-1"));
    expect(response.status).toBe(500);
  });
});
