import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCommentSingle = vi.fn();
const mockProfileSingle = vi.fn();
const mockUpdateResult = vi.fn();
const mockGetChainBySlug = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "chain_comments") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => mockCommentSingle(),
              }),
            }),
          }),
          update: () => ({
            eq: () => mockUpdateResult(),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockProfileSingle(),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock("@/lib/db", () => ({
  getChainBySlug: (...args: unknown[]) => mockGetChainBySlug(...args),
}));

import { DELETE } from "@/app/api/chains/[slug]/comments/[commentId]/route";

function makeParams(slug: string, commentId: string) {
  return { params: Promise.resolve({ slug, commentId }) };
}

describe("DELETE /api/chains/[slug]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/chains/test-chain/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain", "c1"));
    expect(response.status).toBe(401);
  });

  it("returns 404 when chain not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue(null);
    const request = new Request("http://localhost/api/chains/nonexistent/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("nonexistent", "c1"));
    expect(response.status).toBe(404);
  });

  it("returns 403 when user doesn't own comment and isn't admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "other-user", chain_id: "chain-1" },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const request = new Request("http://localhost/api/chains/test-chain/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain", "c1"));
    expect(response.status).toBe(403);
  });

  it("soft-deletes own comment (sets is_deleted=true)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "user-1", chain_id: "chain-1" },
      error: null,
    });
    mockUpdateResult.mockResolvedValue({ error: null });
    const request = new Request("http://localhost/api/chains/test-chain/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain", "c1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });

  it("admin can delete any comment", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "other-user", chain_id: "chain-1" },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
    mockUpdateResult.mockResolvedValue({ error: null });
    const request = new Request("http://localhost/api/chains/test-chain/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain", "c1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });
});
