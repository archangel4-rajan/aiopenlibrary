import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import { POST, DELETE } from "@/app/api/prompts/[id]/vote/route";

describe("POST /api/prompts/[id]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "like" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "POST",
      body: "not json",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid vote_type", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "invalid" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("vote_type");
  });

  it("upserts vote on success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      upsert: mockUpsert.mockReturnValue({ error: null }),
    });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "like" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.vote_type).toBe("like");
    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: "user-1", prompt_id: "p1", vote_type: "like" },
      { onConflict: "user_id,prompt_id" }
    );
  });

  it("returns 500 on database error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      upsert: mockUpsert.mockReturnValue({
        error: { message: "db error" },
      }),
    });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "dislike" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/prompts/[id]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(401);
  });

  it("deletes vote on success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockEq.mockReturnValue({ error: null });
    mockFrom.mockReturnValue({
      delete: mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: mockEq }),
      }),
    });
    const request = new Request("http://localhost/api/prompts/p1/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.vote_type).toBeNull();
  });
});
