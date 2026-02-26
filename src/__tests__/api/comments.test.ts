import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCommentInsertSingle = vi.fn();
const mockParentSingle = vi.fn();
const mockRateLimitCheck = vi.fn().mockReturnValue(true);

vi.mock("@/lib/rate-limit", () => ({
  commentLimiter: { check: (...args: unknown[]) => mockRateLimitCheck(...args) },
}));

vi.mock("@/lib/db", () => ({
  getCommentsByPromptId: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => mockParentSingle(),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => mockCommentInsertSingle(),
        }),
      }),
    }),
  }),
}));

import { POST } from "@/app/api/prompts/[id]/comments/route";

const paramsPromise = Promise.resolve({ id: "prompt-1" });

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/prompts/prompt-1/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/prompts/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitCheck.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makePostRequest({ content: "Hello" }), { params: paramsPromise });
    expect(response.status).toBe(401);
  });

  it("returns 400 when content is empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await POST(makePostRequest({ content: "" }), { params: paramsPromise });
    expect(response.status).toBe(400);
  });

  it("returns 400 when content exceeds 2000 chars", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const longContent = "a".repeat(2001);
    const response = await POST(makePostRequest({ content: longContent }), { params: paramsPromise });
    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRateLimitCheck.mockReturnValue(false);
    const response = await POST(makePostRequest({ content: "Test comment" }), { params: paramsPromise });
    expect(response.status).toBe(429);
  });

  it("creates a comment successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCommentInsertSingle.mockResolvedValue({
      data: {
        id: "comment-1",
        content: "Great prompt!",
        user_id: "user-1",
        prompt_id: "prompt-1",
        parent_id: null,
        is_deleted: false,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        profiles: { display_name: "Test User", avatar_url: null, username: "test" },
      },
      error: null,
    });
    const response = await POST(makePostRequest({ content: "Great prompt!" }), { params: paramsPromise });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.content).toBe("Great prompt!");
    expect(data.author.display_name).toBe("Test User");
  });

  it("returns 500 when database insert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCommentInsertSingle.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });
    const response = await POST(makePostRequest({ content: "Test comment" }), { params: paramsPromise });
    expect(response.status).toBe(500);
  });

  it("returns 400 for invalid JSON body", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const req = new Request("http://localhost/api/prompts/prompt-1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json{{{",
    });
    const response = await POST(req, { params: paramsPromise });
    expect(response.status).toBe(400);
  });
});
