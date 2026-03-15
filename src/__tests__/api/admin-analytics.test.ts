import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const { mockGetUser, mockFrom, mockAdminFrom } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  const mockAdminFrom = vi.fn();
  return { mockGetUser, mockFrom, mockAdminFrom };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

import { GET as getOverview } from "@/app/api/admin/analytics/overview/route";
import { GET as getPrompts } from "@/app/api/admin/analytics/prompts/route";
import { GET as getSearches } from "@/app/api/admin/analytics/searches/route";
import { GET as getEvents } from "@/app/api/admin/analytics/events/route";

function setupAdmin() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => ({ data: { role: "admin" } }),
      }),
    }),
  });
}

function setupNonAdmin() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => ({ data: { role: "user" } }),
      }),
    }),
  });
}

function setupUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}

describe("Admin Analytics Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Auth checks (shared across all endpoints) ─────────────

  describe("authentication", () => {
    it("overview returns 401 when unauthenticated", async () => {
      setupUnauthenticated();
      const req = new Request("http://localhost/api/admin/analytics/overview");
      const res = await getOverview(req);
      expect(res.status).toBe(401);
    });

    it("prompts returns 401 when unauthenticated", async () => {
      setupUnauthenticated();
      const req = new Request("http://localhost/api/admin/analytics/prompts");
      const res = await getPrompts(req);
      expect(res.status).toBe(401);
    });

    it("searches returns 401 when unauthenticated", async () => {
      setupUnauthenticated();
      const req = new Request("http://localhost/api/admin/analytics/searches");
      const res = await getSearches(req);
      expect(res.status).toBe(401);
    });

    it("events returns 401 when unauthenticated", async () => {
      setupUnauthenticated();
      const req = new Request("http://localhost/api/admin/analytics/events");
      const res = await getEvents(req);
      expect(res.status).toBe(401);
    });
  });

  describe("authorization", () => {
    it("overview returns 403 for non-admin", async () => {
      setupNonAdmin();
      const req = new Request("http://localhost/api/admin/analytics/overview");
      const res = await getOverview(req);
      expect(res.status).toBe(403);
    });

    it("prompts returns 403 for non-admin", async () => {
      setupNonAdmin();
      const req = new Request("http://localhost/api/admin/analytics/prompts");
      const res = await getPrompts(req);
      expect(res.status).toBe(403);
    });

    it("searches returns 403 for non-admin", async () => {
      setupNonAdmin();
      const req = new Request("http://localhost/api/admin/analytics/searches");
      const res = await getSearches(req);
      expect(res.status).toBe(403);
    });

    it("events returns 403 for non-admin", async () => {
      setupNonAdmin();
      const req = new Request("http://localhost/api/admin/analytics/events");
      const res = await getEvents(req);
      expect(res.status).toBe(403);
    });
  });

  // ── Overview endpoint ─────────────────────────────────────

  describe("GET /api/admin/analytics/overview", () => {
    it("returns analytics overview for admin", async () => {
      setupAdmin();

      // Mock admin queries — select with count (head:true), select user_id, session_id, select event_type+created_at
      const mockSelect = vi.fn();
      mockAdminFrom.mockReturnValue({ select: mockSelect });

      // Total events (head count)
      mockSelect.mockReturnValueOnce({
        gte: () => ({ count: 10 }),
      });
      // Unique users
      mockSelect.mockReturnValueOnce({
        not: () => ({
          gte: () => ({ data: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "u2" }] }),
        }),
      });
      // Unique sessions
      mockSelect.mockReturnValueOnce({
        not: () => ({
          gte: () => ({ data: [{ session_id: "s1" }, { session_id: "s2" }] }),
        }),
      });
      // Events by type + day
      mockSelect.mockReturnValueOnce({
        gte: () => ({
          data: [
            { event_type: "prompt.view", created_at: "2025-01-01T00:00:00Z" },
            { event_type: "prompt.view", created_at: "2025-01-01T12:00:00Z" },
            { event_type: "search", created_at: "2025-01-02T00:00:00Z" },
          ],
        }),
      });

      const req = new Request("http://localhost/api/admin/analytics/overview?days=7");
      const res = await getOverview(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.total_events).toBe(10);
      expect(data.unique_users).toBe(2);
      expect(data.unique_sessions).toBe(2);
      expect(data.events_by_type["prompt.view"]).toBe(2);
      expect(data.events_by_type["search"]).toBe(1);
      expect(data.events_by_day).toHaveLength(2);
      expect(data.days).toBe(7);
    });
  });

  // ── Prompts endpoint ──────────────────────────────────────

  describe("GET /api/admin/analytics/prompts", () => {
    it("returns top prompts by event type", async () => {
      setupAdmin();

      mockAdminFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              not: () => ({
                gte: () => ({
                  data: [
                    { resource_id: "slug-a" },
                    { resource_id: "slug-a" },
                    { resource_id: "slug-a" },
                    { resource_id: "slug-b" },
                    { resource_id: "slug-b" },
                  ],
                }),
              }),
            }),
          }),
        }),
      });

      const req = new Request("http://localhost/api/admin/analytics/prompts?event_type=prompt.view&limit=10");
      const res = await getPrompts(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.prompts).toHaveLength(2);
      expect(data.prompts[0].resource_id).toBe("slug-a");
      expect(data.prompts[0].count).toBe(3);
      expect(data.prompts[1].resource_id).toBe("slug-b");
      expect(data.prompts[1].count).toBe(2);
      expect(data.event_type).toBe("prompt.view");
    });
  });

  // ── Searches endpoint ─────────────────────────────────────

  describe("GET /api/admin/analytics/searches", () => {
    it("returns top searches and zero-result searches", async () => {
      setupAdmin();

      mockAdminFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            gte: () => ({
              data: [
                { metadata: { query: "React hooks", result_count: 5 } },
                { metadata: { query: "react hooks", result_count: 3 } },
                { metadata: { query: "Supabase auth", result_count: 0 } },
                { metadata: { query: "nonexistent thing", result_count: 0 } },
              ],
            }),
          }),
        }),
      });

      const req = new Request("http://localhost/api/admin/analytics/searches?limit=10");
      const res = await getSearches(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.top_searches.length).toBeGreaterThan(0);
      // "react hooks" (normalized) should have count 2
      const reactHooks = data.top_searches.find((s: { query: string }) => s.query === "react hooks");
      expect(reactHooks?.count).toBe(2);

      expect(data.zero_result_searches.length).toBeGreaterThan(0);
    });
  });

  // ── Events endpoint ───────────────────────────────────────

  describe("GET /api/admin/analytics/events", () => {
    it("returns paginated event feed", async () => {
      setupAdmin();

      const mockEvents = [
        { id: "1", event_type: "prompt.view", created_at: "2025-01-01T00:00:00Z" },
        { id: "2", event_type: "search", created_at: "2025-01-01T01:00:00Z" },
      ];

      mockAdminFrom.mockReturnValue({
        select: () => ({
          gte: () => ({
            order: () => ({
              range: () => ({
                eq: () => ({
                  eq: () => ({ data: mockEvents, count: 2, error: null }),
                }),
                data: mockEvents,
                count: 2,
                error: null,
              }),
            }),
          }),
        }),
      });

      const req = new Request("http://localhost/api/admin/analytics/events?limit=10&offset=0");
      const res = await getEvents(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.events).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.offset).toBe(0);
    });

    it("supports event_type filter", async () => {
      setupAdmin();

      mockAdminFrom.mockReturnValue({
        select: () => ({
          gte: () => ({
            order: () => ({
              range: () => ({
                eq: () => ({ data: [], count: 0, error: null }),
              }),
            }),
          }),
        }),
      });

      const req = new Request(
        "http://localhost/api/admin/analytics/events?event_type=prompt.view"
      );
      const res = await getEvents(req);
      expect(res.status).toBe(200);
    });
  });
});
