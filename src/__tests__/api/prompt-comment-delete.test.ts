import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCommentSingle = vi.fn();
const mockProfileSingle = vi.fn();
const mockUpdateResult = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "prompt_comments") {
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

import { DELETE } from "@/app/api/prompts/[id]/comments/[commentId]/route";

function makeParams(id: string, commentId: string) {
  return { params: Promise.resolve({ id, commentId }) };
}

describe("DELETE /api/prompts/[id]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/prompts/p1/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("p1", "c1"));
    expect(response.status).toBe(401);
  });

  it("returns 404 when comment not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCommentSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const request = new Request("http://localhost/api/prompts/p1/comments/nonexistent", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("p1", "nonexistent"));
    expect(response.status).toBe(404);
  });

  it("returns 403 when not comment owner and not admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "other-user", prompt_id: "p1" },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const request = new Request("http://localhost/api/prompts/p1/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("p1", "c1"));
    expect(response.status).toBe(403);
  });

  it("soft-deletes own comment", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "user-1", prompt_id: "p1" },
      error: null,
    });
    mockUpdateResult.mockResolvedValue({ error: null });
    const request = new Request("http://localhost/api/prompts/p1/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("p1", "c1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });

  it("admin can delete any comment", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockCommentSingle.mockResolvedValue({
      data: { id: "c1", user_id: "other-user", prompt_id: "p1" },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
    mockUpdateResult.mockResolvedValue({ error: null });
    const request = new Request("http://localhost/api/prompts/p1/comments/c1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("p1", "c1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });
});
