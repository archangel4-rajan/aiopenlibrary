import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockGetUserSavedPromptIds = vi.fn();

vi.mock("@/lib/auth", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("@/lib/db", () => ({
  getUserSavedPromptIds: (...args: unknown[]) =>
    mockGetUserSavedPromptIds(...args),
}));

import { GET } from "@/app/api/user/saved-ids/route";

describe("GET /api/user/saved-ids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when not authenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("returns saved prompt IDs when authenticated", async () => {
    mockGetUser.mockResolvedValue({ id: "user-1" });
    mockGetUserSavedPromptIds.mockResolvedValue(["p1", "p2", "p3"]);
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(["p1", "p2", "p3"]);
    expect(mockGetUserSavedPromptIds).toHaveBeenCalledWith("user-1");
  });

  it("returns empty array on error", async () => {
    mockGetUser.mockRejectedValue(new Error("auth error"));
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual([]);
  });
});
