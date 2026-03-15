import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert } = vi.hoisted(() => {
  const mockInsert = vi.fn();
  return { mockInsert };
});

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({ insert: mockInsert }),
  })),
}));

import {
  trackActivity,
  trackActivities,
  trackPromptView,
  trackPromptCopy,
  trackPromptSave,
  trackPromptUnsave,
  trackPromptVote,
  trackSearch,
  trackPageView,
} from "@/lib/activity";

describe("activity tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  describe("trackActivity", () => {
    it("inserts a single event via admin client", async () => {
      await trackActivity({
        event_type: "prompt.view",
        user_id: "user-1",
        session_id: "sess-1",
        resource_type: "prompt",
        resource_id: "test-slug",
        metadata: { foo: "bar" },
      });

      expect(mockInsert).toHaveBeenCalledWith({
        event_type: "prompt.view",
        user_id: "user-1",
        session_id: "sess-1",
        resource_type: "prompt",
        resource_id: "test-slug",
        metadata: { foo: "bar" },
      });
    });

    it("defaults nullable fields to null and metadata to {}", async () => {
      await trackActivity({ event_type: "page.view" });

      expect(mockInsert).toHaveBeenCalledWith({
        event_type: "page.view",
        user_id: null,
        session_id: null,
        resource_type: null,
        resource_id: null,
        metadata: {},
      });
    });

    it("never throws on insert error", async () => {
      mockInsert.mockResolvedValue({ error: { message: "db error" } });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        trackActivity({ event_type: "prompt.view" })
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("never throws on unexpected exception", async () => {
      mockInsert.mockRejectedValue(new Error("network failure"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        trackActivity({ event_type: "prompt.view" })
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe("trackActivities", () => {
    it("inserts multiple events in one call", async () => {
      await trackActivities([
        { event_type: "prompt.view", resource_id: "a" },
        { event_type: "prompt.copy", resource_id: "b" },
      ]);

      expect(mockInsert).toHaveBeenCalledTimes(1);
      const arg = mockInsert.mock.calls[0][0];
      expect(arg).toHaveLength(2);
      expect(arg[0].event_type).toBe("prompt.view");
      expect(arg[1].event_type).toBe("prompt.copy");
    });

    it("does nothing for empty array", async () => {
      await trackActivities([]);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("never throws on error", async () => {
      mockInsert.mockResolvedValue({ error: { message: "db error" } });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        trackActivities([{ event_type: "prompt.view" }])
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe("helper factories", () => {
    it("trackPromptView inserts correct event", async () => {
      await trackPromptView("my-prompt", "user-1", "sess-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "prompt.view",
          resource_type: "prompt",
          resource_id: "my-prompt",
          user_id: "user-1",
          session_id: "sess-1",
        })
      );
    });

    it("trackPromptCopy inserts correct event", async () => {
      await trackPromptCopy("my-prompt", "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "prompt.copy",
          resource_type: "prompt",
          resource_id: "my-prompt",
        })
      );
    });

    it("trackPromptSave inserts correct event", async () => {
      await trackPromptSave("slug-1", "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "prompt.save",
          resource_type: "prompt",
          resource_id: "slug-1",
        })
      );
    });

    it("trackPromptUnsave inserts correct event", async () => {
      await trackPromptUnsave("slug-1", "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "prompt.unsave",
          resource_type: "prompt",
          resource_id: "slug-1",
        })
      );
    });

    it("trackPromptVote includes vote_type in metadata", async () => {
      await trackPromptVote("slug-1", "like", "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "prompt.vote",
          resource_type: "prompt",
          resource_id: "slug-1",
          metadata: { vote_type: "like" },
        })
      );
    });

    it("trackSearch includes query and result_count in metadata", async () => {
      await trackSearch("test query", 5, "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "search",
          metadata: { query: "test query", result_count: 5 },
        })
      );
    });

    it("trackPageView inserts correct event", async () => {
      await trackPageView("/prompts", "user-1");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "page.view",
          resource_type: "page",
          resource_id: "/prompts",
        })
      );
    });
  });
});
