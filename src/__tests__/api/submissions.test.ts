import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockGetUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getUser: () => mockGetUser(),
}));

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      insert: (...args: unknown[]) => {
        mockInsert(...args);
        return {
          select: (...sArgs: unknown[]) => {
            mockSelect(...sArgs);
            return { single: () => mockSingle() };
          },
        };
      },
    }),
  }),
  isSupabaseConfigured: () => true,
}));

// Mock rate limiter
const mockCheck = vi.fn().mockReturnValue(true);
vi.mock("@/lib/rate-limit", () => ({
  submissionLimiter: { check: (...args: unknown[]) => mockCheck(...args) },
}));

import { POST } from "@/app/api/submissions/route";

describe("POST /api/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const request = new Request("http://localhost/api/submissions", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockGetUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mockCheck.mockReturnValue(false);
    const request = new Request("http://localhost/api/submissions", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    const request = new Request("http://localhost/api/submissions", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }), // missing description, category_id, prompt
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 201 on successful submission", async () => {
    mockGetUser.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    mockSingle.mockResolvedValue({
      data: { id: "sub-1", title: "Test Prompt" },
      error: null,
    });

    const request = new Request("http://localhost/api/submissions", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Prompt",
        description: "A test prompt",
        category_id: "cat-1",
        category_name: "Test",
        category_slug: "test",
        prompt: "Do the thing",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
