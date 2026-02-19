import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase — use vi.hoisted to avoid hoisting issues
const { mockGetUser, mockFrom } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  return { mockGetUser, mockFrom };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

// Mock rate limiter
const { mockCheck } = vi.hoisted(() => {
  const mockCheck = vi.fn().mockReturnValue(true);
  return { mockCheck };
});

vi.mock("@/lib/rate-limit", () => ({
  saveLimiter: { check: (...args: unknown[]) => mockCheck(...args) },
}));

import { POST, DELETE } from "@/app/api/prompts/[id]/save/route";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/prompts/[id]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("abc"));
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCheck.mockReturnValue(false);
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("abc"));
    expect(response.status).toBe(429);
  });

  it("returns saved:true on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockReturnValue({
      insert: () => ({ error: null }),
    });
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("abc"));
    const data = await response.json();
    expect(data.saved).toBe(true);
  });

  it("handles duplicate save (unique constraint violation)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockReturnValue({
      insert: () => ({ error: { code: "23505", message: "duplicate" } }),
    });
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("abc"));
    const data = await response.json();
    expect(data.saved).toBe(true);
    expect(response.status).toBe(200);
  });
});

describe("DELETE /api/prompts/[id]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("abc"));
    expect(response.status).toBe(401);
  });

  it("returns saved:false on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          eq: () => ({ error: null }),
        }),
      }),
    });
    const request = new Request("http://localhost/api/prompts/abc/save", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("abc"));
    const data = await response.json();
    expect(data.saved).toBe(false);
  });
});
