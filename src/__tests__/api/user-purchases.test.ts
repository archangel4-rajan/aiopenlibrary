import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockGetUserPurchasedPromptIds = vi.fn();
const mockGetUserPurchasedPackIds = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

vi.mock("@/lib/db", () => ({
  getUserPurchasedPromptIds: (...args: unknown[]) => mockGetUserPurchasedPromptIds(...args),
  getUserPurchasedPackIds: (...args: unknown[]) => mockGetUserPurchasedPackIds(...args),
}));

import { GET } from "@/app/api/user/purchases/route";

describe("GET /api/user/purchases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns purchases for user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetUserPurchasedPromptIds.mockResolvedValue(["prompt-1", "prompt-2"]);
    mockGetUserPurchasedPackIds.mockResolvedValue(["pack-1"]);
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.promptIds).toEqual(["prompt-1", "prompt-2"]);
    expect(data.packIds).toEqual(["pack-1"]);
  });
});
