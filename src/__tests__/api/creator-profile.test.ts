import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileUpdate = vi.fn();
const mockUsernameCheck = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockProfileUpdate(), // for GET
          neq: () => ({
            single: () => mockUsernameCheck(),
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => mockProfileUpdate(),
          }),
        }),
      }),
    }),
  }),
}));

import { PUT } from "@/app/api/user/profile/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await PUT(makeRequest({ display_name: "Test" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 when username has invalid characters", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await PUT(makeRequest({ username: "Bad User!" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.toLowerCase()).toContain("username");
  });

  it("returns 400 when username is too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await PUT(makeRequest({ username: "ab" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when username is too long", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await PUT(makeRequest({ username: "a".repeat(31) }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when bio exceeds 200 chars", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await PUT(makeRequest({ bio: "a".repeat(201) }));
    expect(response.status).toBe(400);
  });

  it("returns 409 when username is already taken", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUsernameCheck.mockResolvedValue({ data: { id: "other-user" } });
    const response = await PUT(makeRequest({ username: "taken-name" }));
    expect(response.status).toBe(409);
  });

  it("updates profile successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUsernameCheck.mockResolvedValue({ data: null });
    mockProfileUpdate.mockResolvedValue({
      data: { id: "user-1", username: "cool-creator", display_name: "Cool", bio: "Hi" },
      error: null,
    });
    const response = await PUT(makeRequest({
      username: "cool-creator",
      display_name: "Cool",
      bio: "Hi",
    }));
    expect(response.status).toBe(200);
  });
});
