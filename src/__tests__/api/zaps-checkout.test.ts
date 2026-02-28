import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockPackageSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => mockPackageSingle(),
          }),
        }),
      }),
    }),
  }),
}));

import { POST } from "@/app/api/zaps/checkout/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/zaps/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/zaps/checkout", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest({ packageId: "pkg-1" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 when packageId missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("packageId");
  });

  it("returns 404 when package not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPackageSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const response = await POST(makeRequest({ packageId: "nonexistent" }));
    expect(response.status).toBe(404);
  });

  it("returns 503 when Stripe not configured", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPackageSingle.mockResolvedValue({
      data: { id: "pkg-1", name: "Starter", zap_amount: 100, price_cents: 499, is_active: true },
      error: null,
    });
    // STRIPE_SECRET_KEY is not set
    const response = await POST(makeRequest({ packageId: "pkg-1" }));
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toContain("not configured");
  });
});
