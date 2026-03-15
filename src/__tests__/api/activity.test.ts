import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const { mockGetUser } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  return { mockGetUser };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createAdminClient: vi.fn(() => ({
    from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
  })),
}));

// Mock rate limiter
const { mockCheck } = vi.hoisted(() => {
  const mockCheck = vi.fn().mockReturnValue(true);
  return { mockCheck };
});

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({ check: mockCheck }),
  getClientIp: () => "127.0.0.1",
}));

import { POST } from "@/app/api/activity/route";

describe("POST /api/activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheck.mockReturnValue(true);
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockReturnValue(false);
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "page.view" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for invalid event_type", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "invalid.event" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("No valid events");
  });

  it("returns 400 for missing event_type", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource_id: "test" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("tracks a single valid event (anonymous)", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "prompt.view",
        session_id: "sess-1",
        resource_type: "prompt",
        resource_id: "my-prompt",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tracked).toBe(1);
  });

  it("tracks a single event with authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "prompt.copy",
        resource_type: "prompt",
        resource_id: "test",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tracked).toBe(1);
  });

  it("tracks a batch of events", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          { event_type: "page.view", resource_type: "page", resource_id: "/home" },
          { event_type: "prompt.view", resource_type: "prompt", resource_id: "slug-1" },
          { event_type: "search", metadata: { query: "hello" } },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tracked).toBe(3);
  });

  it("filters out invalid events from a batch", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          { event_type: "prompt.view" },
          { event_type: "invalid.type" },
          { event_type: "search" },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tracked).toBe(2);
  });

  it("returns 400 if all events in batch are invalid", async () => {
    const request = new Request("http://localhost/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          { event_type: "bad.one" },
          { event_type: "bad.two" },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("validates all allowed event types", async () => {
    const allowedTypes = [
      "prompt.view",
      "prompt.copy",
      "prompt.save",
      "prompt.unsave",
      "prompt.vote",
      "search",
      "page.view",
    ];
    for (const type of allowedTypes) {
      const request = new Request("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: type }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
