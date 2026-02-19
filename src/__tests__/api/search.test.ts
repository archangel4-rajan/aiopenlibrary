import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
const mockSearchPromptsWithFilters = vi.fn();
vi.mock("@/lib/db", () => ({
  searchPromptsWithFilters: (...args: unknown[]) =>
    mockSearchPromptsWithFilters(...args),
}));

// Mock rate limiter
const mockCheck = vi.fn().mockReturnValue(true);
vi.mock("@/lib/rate-limit", () => ({
  searchLimiter: { check: (...args: unknown[]) => mockCheck(...args) },
  getClientIp: () => "127.0.0.1",
}));

import { GET } from "@/app/api/search/route";

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
  });

  it("passes the query and filters to searchPromptsWithFilters", async () => {
    mockSearchPromptsWithFilters.mockResolvedValue([]);
    const request = new Request(
      "http://localhost/api/search?q=test&category=coding&difficulty=intermediate&model=claude"
    );
    await GET(request);
    expect(mockSearchPromptsWithFilters).toHaveBeenCalledWith("test", {
      category: "coding",
      difficulty: "intermediate",
      model: "claude",
    });
  });

  it("defaults to empty string when q is missing", async () => {
    mockSearchPromptsWithFilters.mockResolvedValue([]);
    const request = new Request("http://localhost/api/search");
    await GET(request);
    expect(mockSearchPromptsWithFilters).toHaveBeenCalledWith("", {
      category: undefined,
      difficulty: undefined,
      model: undefined,
    });
  });

  it("returns JSON results", async () => {
    const mockData = [{ id: "1", title: "Test" }];
    mockSearchPromptsWithFilters.mockResolvedValue(mockData);
    const request = new Request("http://localhost/api/search?q=test");
    const response = await GET(request);
    const data = await response.json();
    expect(data).toEqual(mockData);
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockReturnValue(false);
    const request = new Request("http://localhost/api/search?q=test");
    const response = await GET(request);
    expect(response.status).toBe(429);
  });
});
