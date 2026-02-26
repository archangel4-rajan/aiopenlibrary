import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockBalanceSingle = vi.fn();
const mockBalanceInsert = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockBalanceSingle(),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => mockBalanceInsert(),
        }),
      }),
      upsert: () => ({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/db", () => ({
  ensureZapBalance: vi.fn().mockResolvedValue(undefined),
  getZapBalance: vi.fn().mockResolvedValue({ balance: 500, total_earned: 100, total_spent: 200 }),
}));

import { GET } from "@/app/api/zaps/balance/route";

describe("GET /api/zaps/balance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns balance for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.balance).toBe(500);
    expect(data.total_earned).toBe(100);
    expect(data.total_spent).toBe(200);
  });
});
