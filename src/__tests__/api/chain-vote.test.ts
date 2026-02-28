import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();
const mockGetChainBySlug = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

vi.mock("@/lib/db", () => ({
  getChainBySlug: (...args: unknown[]) => mockGetChainBySlug(...args),
}));

import { POST, DELETE } from "@/app/api/chains/[slug]/vote/route";

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

function makePostRequest(slug: string, body: Record<string, unknown>) {
  return new Request(`http://localhost/api/chains/${slug}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chains/[slug]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(
      makePostRequest("test-chain", { vote_type: "like" }),
      makeParams("test-chain")
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 when vote_type is invalid", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await POST(
      makePostRequest("test-chain", { vote_type: "invalid" }),
      makeParams("test-chain")
    );
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("vote_type");
  });

  it("returns 404 when chain not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue(null);
    const response = await POST(
      makePostRequest("nonexistent", { vote_type: "like" }),
      makeParams("nonexistent")
    );
    expect(response.status).toBe(404);
  });

  it("creates new vote successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockFrom.mockReturnValue({
      upsert: mockUpsert.mockReturnValue({ error: null }),
    });
    const response = await POST(
      makePostRequest("test-chain", { vote_type: "like" }),
      makeParams("test-chain")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.vote_type).toBe("like");
    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: "user-1", chain_id: "chain-1", vote_type: "like" },
      { onConflict: "user_id,chain_id" }
    );
  });

  it("updates existing vote", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockFrom.mockReturnValue({
      upsert: mockUpsert.mockReturnValue({ error: null }),
    });
    const response = await POST(
      makePostRequest("test-chain", { vote_type: "dislike" }),
      makeParams("test-chain")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.vote_type).toBe("dislike");
  });

  it("returns 500 on database error", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockFrom.mockReturnValue({
      upsert: mockUpsert.mockReturnValue({ error: { message: "db error" } }),
    });
    const response = await POST(
      makePostRequest("test-chain", { vote_type: "like" }),
      makeParams("test-chain")
    );
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/chains/[slug]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/chains/test-chain/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain"));
    expect(response.status).toBe(401);
  });

  it("returns 404 when chain not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue(null);
    const request = new Request("http://localhost/api/chains/nonexistent/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("nonexistent"));
    expect(response.status).toBe(404);
  });

  it("removes vote successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1" });
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ error: null }),
        }),
      }),
    });
    const request = new Request("http://localhost/api/chains/test-chain/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.vote_type).toBeNull();
  });
});
