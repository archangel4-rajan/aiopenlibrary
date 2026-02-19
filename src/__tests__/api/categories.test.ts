import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetCategories = vi.fn();

vi.mock("@/lib/db", () => ({
  getCategories: (...args: unknown[]) => mockGetCategories(...args),
}));

import { GET } from "@/app/api/categories/route";

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns categories on success", async () => {
    const mockData = [
      { id: "1", name: "Coding", slug: "coding" },
      { id: "2", name: "Writing", slug: "writing" },
    ];
    mockGetCategories.mockResolvedValue(mockData);
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(mockData);
    expect(response.status).toBe(200);
  });

  it("returns empty array when no categories", async () => {
    mockGetCategories.mockResolvedValue([]);
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("returns 500 on error", async () => {
    mockGetCategories.mockRejectedValue(new Error("DB error"));
    const response = await GET();
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to fetch categories");
  });
});
