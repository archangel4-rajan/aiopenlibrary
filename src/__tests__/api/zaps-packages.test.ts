import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetZapPackages = vi.fn();

vi.mock("@/lib/db", () => ({
  getZapPackages: (...args: unknown[]) => mockGetZapPackages(...args),
}));

import { GET } from "@/app/api/zaps/packages/route";

describe("GET /api/zaps/packages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active packages", async () => {
    const mockPackages = [
      { id: "pkg-1", name: "Starter", zap_amount: 100, price_cents: 499, is_active: true },
      { id: "pkg-2", name: "Pro", zap_amount: 500, price_cents: 1999, is_active: true },
    ];
    mockGetZapPackages.mockResolvedValue(mockPackages);
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe("Starter");
    expect(data[1].name).toBe("Pro");
  });
});
