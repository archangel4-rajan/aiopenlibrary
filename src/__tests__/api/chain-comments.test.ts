import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCommentInsertSingle = vi.fn();
const mockParentSingle = vi.fn();
const mockRateLimitCheck = vi.fn().mockReturnValue(true);
const mockGetChainBySlug = vi.fn();
const mockGetChainComments = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  commentLimiter: { check: (...args: unknown[]) => mockRateLimitCheck(...args) },
}));

vi.mock("@/lib/db", () => ({
  getChainBySlug: (...args: unknown[]) => mockGetChainBySlug(...args),
  getChainComments: (...args: unknown[]) => mockGetChainComments(...args),
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

import { GET, POST } from "@/app/api/chains/[slug]/comments/route";

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/chains/test-chain/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/chains/[slug]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns comments for a chain", async () => {
    const mockComments = [
      { id: "c1", content: "Great chain!", author: { display_name: "Test" } },
    ];
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockGetChainComments.mockResolvedValue(mockComments);
    const request = new Request("http://localhost/api/chains/test-chain/comments", {
      method: "GET",
    });
    const response = await GET(request, makeParams("test-chain"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockComments);
  });

  it("returns 404 when chain not found", async () => {
    mockGetChainBySlug.mockResolvedValue(null);
    const request = new Request("http://localhost/api/chains/nonexistent/comments", {
      method: "GET",
    });
    const response = await GET(request, makeParams("nonexistent"));
    expect(response.status).toBe(404);
  });
});

describe("POST /api/chains/[slug]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitCheck.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makePostRequest({ content: "Hello" }), makeParams("test-chain"));
    expect(response.status).toBe(401);
  });

  it("returns 400 when content is empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    const response = await POST(makePostRequest({ content: "" }), makeParams("test-chain"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when content exceeds 2000 chars", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    const longContent = "a".repeat(2001);
    const response = await POST(makePostRequest({ content: longContent }), makeParams("test-chain"));
    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRateLimitCheck.mockReturnValue(false);
    const response = await POST(makePostRequest({ content: "Test comment" }), makeParams("test-chain"));
    expect(response.status).toBe(429);
  });

  it("creates comment successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockCommentInsertSingle.mockResolvedValue({
      data: {
        id: "comment-1",
        chain_id: "chain-1",
        user_id: "user-1",
        content: "Great chain!",
        parent_id: null,
        is_deleted: false,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        profiles: { display_name: "Test User", avatar_url: null, username: "test" },
      },
      error: null,
    });
    const response = await POST(makePostRequest({ content: "Great chain!" }), makeParams("test-chain"));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.content).toBe("Great chain!");
    expect(data.author.display_name).toBe("Test User");
  });

  it("returns 400 for invalid JSON", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    const req = new Request("http://localhost/api/chains/test-chain/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json{{{",
    });
    const response = await POST(req, makeParams("test-chain"));
    expect(response.status).toBe(400);
  });

  it("returns 500 when database insert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockCommentInsertSingle.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });
    const response = await POST(makePostRequest({ content: "Test comment" }), makeParams("test-chain"));
    expect(response.status).toBe(500);
  });
});
