import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockCheck = vi.fn().mockReturnValue(true);
const mockGetChainBySlug = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  saveLimiter: { check: (...args: unknown[]) => mockCheck(...args) },
}));

vi.mock("@/lib/db", () => ({
  getChainBySlug: (...args: unknown[]) => mockGetChainBySlug(...args),
}));

import { POST, DELETE } from "@/app/api/chains/[slug]/save/route";

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("POST /api/chains/[slug]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("test-chain"));
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCheck.mockReturnValue(false);
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("test-chain"));
    expect(response.status).toBe(429);
  });

  it("returns 404 when chain not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue(null);
    const request = new Request("http://localhost/api/chains/nonexistent/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("nonexistent"));
    expect(response.status).toBe(404);
  });

  it("saves chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1", saves_count: 5 });
    mockFrom.mockReturnValue({
      insert: () => ({ error: null }),
      update: () => ({ eq: () => ({ error: null }) }),
    });
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("test-chain"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.saved).toBe(true);
  });

  it("handles duplicate save gracefully (23505 error code)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1", saves_count: 5 });
    mockFrom.mockReturnValue({
      insert: () => ({ error: { code: "23505", message: "duplicate" } }),
    });
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "POST",
    });
    const response = await POST(request, makeParams("test-chain"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.saved).toBe(true);
  });
});

describe("DELETE /api/chains/[slug]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain"));
    expect(response.status).toBe(401);
  });

  it("unsaves chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetChainBySlug.mockResolvedValue({ id: "chain-1", saves_count: 5 });
    mockFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          eq: () => ({ error: null }),
        }),
      }),
      update: () => ({ eq: () => ({ error: null }) }),
    });
    const request = new Request("http://localhost/api/chains/test-chain/save", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("test-chain"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.saved).toBe(false);
  });
});
