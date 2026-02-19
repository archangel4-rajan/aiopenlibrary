import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
const mockSearchPrompts = vi.fn();
vi.mock("@/lib/db", () => ({
  searchPrompts: (...args: unknown[]) => mockSearchPrompts(...args),
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

  it("passes the query param to searchPrompts", async () => {
    mockSearchPrompts.mockResolvedValue([]);
    const request = new Request("http://localhost/api/search?q=test");
    await GET(request);
    expect(mockSearchPrompts).toHaveBeenCalledWith("test");
  });

  it("defaults to empty string when q is missing", async () => {
    mockSearchPrompts.mockResolvedValue([]);
    const request = new Request("http://localhost/api/search");
    await GET(request);
    expect(mockSearchPrompts).toHaveBeenCalledWith("");
  });

  it("returns JSON results", async () => {
    const mockData = [{ id: "1", title: "Test" }];
    mockSearchPrompts.mockResolvedValue(mockData);
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
