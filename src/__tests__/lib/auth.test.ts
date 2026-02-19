import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import { getUser, getProfile, isAdmin } from "@/lib/auth";

describe("getUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when authenticated", async () => {
    const mockUserData = { id: "user-1", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUserData } });
    const user = await getUser();
    expect(user).toEqual(mockUserData);
  });

  it("returns null when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const user = await getUser();
    expect(user).toBeNull();
  });

  it("returns null on error", async () => {
    mockGetUser.mockRejectedValue(new Error("auth error"));
    const user = await getUser();
    expect(user).toBeNull();
  });
});

describe("getProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const profile = await getProfile();
    expect(profile).toBeNull();
  });

  it("returns profile for authenticated user", async () => {
    const mockUserData = { id: "user-1" };
    const mockProfile = {
      id: "user-1",
      display_name: "Test User",
      role: "user",
    };
    // getUser is called first, then getProfile calls createClient again
    mockGetUser.mockResolvedValue({ data: { user: mockUserData } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
          }),
        }),
      }),
    });
    const profile = await getProfile();
    expect(profile).toEqual(mockProfile);
  });
});

describe("isAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await isAdmin();
    expect(result).toBe(false);
  });

  it("returns false for non-admin user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", role: "user" },
          }),
        }),
      }),
    });
    const result = await isAdmin();
    expect(result).toBe(false);
  });

  it("returns true for admin user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "admin-1", role: "admin" },
          }),
        }),
      }),
    });
    const result = await isAdmin();
    expect(result).toBe(true);
  });
});
