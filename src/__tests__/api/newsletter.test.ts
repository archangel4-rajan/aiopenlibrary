import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const { mockGetUser, mockFrom } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  return { mockGetUser, mockFrom };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock rate limiter
const { mockCheck } = vi.hoisted(() => {
  const mockCheck = vi.fn().mockReturnValue(true);
  return { mockCheck };
});

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({ check: mockCheck }),
  getClientIp: () => "127.0.0.1",
}));

import { POST } from "@/app/api/newsletter/subscribe/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/newsletter/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockReturnValue(false);
    const res = await POST(makeRequest({ email: "test@example.com" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("valid email");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty email", async () => {
    const res = await POST(makeRequest({ email: "" }));
    expect(res.status).toBe(400);
  });

  it("subscribes a new email successfully", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const res = await POST(makeRequest({ email: "new@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("subscribed");
  });

  it("returns success for already-active subscriber (idempotent)", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "sub-1", status: "active" },
          }),
        }),
      }),
    });

    const res = await POST(makeRequest({ email: "existing@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("already subscribed");
  });

  it("reactivates an unsubscribed email", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "sub-2", status: "unsubscribed" },
          }),
        }),
      }),
      update: mockUpdate,
    });

    const res = await POST(makeRequest({ email: "unsub@example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("re-subscribed");
  });

  it("attaches user_id when authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      insert: mockInsert,
    });

    const res = await POST(makeRequest({ email: "authed@example.com" }));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-123" })
    );
  });

  it("returns 500 on database error", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
    });

    const res = await POST(makeRequest({ email: "fail@example.com" }));
    expect(res.status).toBe(500);
  });
});
