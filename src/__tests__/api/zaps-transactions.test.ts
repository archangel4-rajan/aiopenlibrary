import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockGetZapTransactions = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

vi.mock("@/lib/db", () => ({
  getZapTransactions: (...args: unknown[]) => mockGetZapTransactions(...args),
}));

import { GET } from "@/app/api/zaps/transactions/route";

describe("GET /api/zaps/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/zaps/transactions", {
      method: "GET",
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns transactions for user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const mockTransactions = [
      { id: "tx-1", amount: -100, description: "Purchased prompt", created_at: "2026-01-01" },
      { id: "tx-2", amount: 500, description: "Bought Zaps", created_at: "2026-01-01" },
    ];
    mockGetZapTransactions.mockResolvedValue(mockTransactions);
    const request = new Request("http://localhost/api/zaps/transactions", {
      method: "GET",
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(2);
    expect(mockGetZapTransactions).toHaveBeenCalledWith("user-1", 50);
  });

  it("respects limit parameter", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetZapTransactions.mockResolvedValue([]);
    const request = new Request("http://localhost/api/zaps/transactions?limit=10", {
      method: "GET",
    });
    await GET(request);
    expect(mockGetZapTransactions).toHaveBeenCalledWith("user-1", 10);
  });
});
