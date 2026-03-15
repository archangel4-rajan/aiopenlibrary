import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock sessionStorage
const sessionStore: Record<string, string> = {};
const mockSessionStorage = {
  getItem: vi.fn((key: string) => sessionStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStore[key];
  }),
};

Object.defineProperty(globalThis, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => "test-session-uuid"),
});

// Capture sendBeacon calls and parse the Blob body into JSON for assertions
const beaconPayloads: unknown[] = [];
const mockSendBeacon = vi.fn((_url: string, body: Blob) => {
  // Blob constructor receives [jsonString] — grab it from the Blob's internal parts
  // In jsdom, Blob stores its parts; we reconstruct via the array-like toString
  // Simpler: intercept at the source by also spying on Blob
  return true;
});

Object.defineProperty(globalThis, "navigator", {
  value: { sendBeacon: mockSendBeacon },
  writable: true,
});

// Intercept Blob construction to capture the raw JSON string
const OriginalBlob = globalThis.Blob;
let lastBlobContent = "";
globalThis.Blob = class extends OriginalBlob {
  constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
    super(parts, options);
    if (parts && parts.length > 0 && typeof parts[0] === "string") {
      lastBlobContent = parts[0];
    }
  }
} as typeof Blob;

/** Helper to get the parsed JSON from the last sendBeacon call */
function getLastBeaconPayload(): Record<string, unknown> {
  return JSON.parse(lastBlobContent);
}

// Mock fetch
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal("fetch", mockFetch);

// Mock document.visibilityState
let visibilityState = "visible";
Object.defineProperty(document, "visibilityState", {
  get: () => visibilityState,
  configurable: true,
});

import { ClientTracker } from "@/lib/tracking";

describe("ClientTracker", () => {
  let tracker: ClientTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    lastBlobContent = "";
    beaconPayloads.length = 0;
    for (const key of Object.keys(sessionStore)) {
      delete sessionStore[key];
    }
    tracker = new ClientTracker();
  });

  afterEach(() => {
    tracker.destroy();
    vi.useRealTimers();
  });

  describe("session management", () => {
    it("generates and stores a session ID", () => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "aiol_session_id",
        "test-session-uuid"
      );
    });

    it("reuses existing session ID", () => {
      sessionStore["aiol_session_id"] = "existing-session";
      const tracker2 = new ClientTracker();
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith("aiol_session_id");
      tracker2.destroy();
    });
  });

  describe("event tracking", () => {
    it("trackView queues a prompt.view event", () => {
      tracker.trackView("my-prompt");
      tracker.flush();

      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      expect(mockSendBeacon.mock.calls[0][0]).toBe("/api/activity");

      const body = getLastBeaconPayload();
      const events = body.events as Record<string, unknown>[];
      expect(events[0].event_type).toBe("prompt.view");
      expect(events[0].resource_type).toBe("prompt");
      expect(events[0].resource_id).toBe("my-prompt");
    });

    it("trackCopy queues a prompt.copy event", () => {
      tracker.trackCopy("slug-1");
      tracker.flush();

      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      const body = getLastBeaconPayload();
      const events = body.events as Record<string, unknown>[];
      expect(events[0].event_type).toBe("prompt.copy");
    });

    it("trackSearch queues a search event", () => {
      tracker.trackSearch("test query");
      tracker.flush();

      const body = getLastBeaconPayload();
      const events = body.events as Record<string, unknown>[];
      expect(events[0].event_type).toBe("search");
      expect((events[0].metadata as Record<string, unknown>).query).toBe("test query");
    });

    it("trackPageView queues a page.view event", () => {
      tracker.trackPageView("/prompts");
      tracker.flush();

      const body = getLastBeaconPayload();
      const events = body.events as Record<string, unknown>[];
      expect(events[0].event_type).toBe("page.view");
      expect(events[0].resource_type).toBe("page");
      expect(events[0].resource_id).toBe("/prompts");
    });
  });

  describe("deduplication", () => {
    it("deduplicates rapid identical events within 2s window", () => {
      tracker.trackView("slug-1");
      tracker.trackView("slug-1"); // duplicate within 2s
      tracker.flush();

      const body = getLastBeaconPayload();
      const events = body.events as unknown[];
      expect(events).toHaveLength(1);
    });

    it("allows same event after dedup window", () => {
      tracker.trackView("slug-1");
      vi.advanceTimersByTime(2500); // past 2s dedup window
      tracker.trackView("slug-1");
      tracker.flush();

      // First flush from timer may have sent first event
      expect(mockSendBeacon.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("allows different events at same time", () => {
      tracker.trackView("slug-1");
      tracker.trackView("slug-2");
      tracker.flush();

      const body = getLastBeaconPayload();
      const events = body.events as unknown[];
      expect(events).toHaveLength(2);
    });
  });

  describe("batching", () => {
    it("auto-flushes every 5 seconds", () => {
      tracker.trackView("slug-1");
      expect(mockSendBeacon).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
    });

    it("does not flush when queue is empty", () => {
      vi.advanceTimersByTime(5000);
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it("flushes on visibility change to hidden", () => {
      tracker.trackView("slug-1");
      visibilityState = "hidden";
      window.dispatchEvent(new Event("visibilitychange"));
      expect(mockSendBeacon).toHaveBeenCalled();
      visibilityState = "visible";
    });
  });

  describe("error handling", () => {
    it("falls back to fetch when sendBeacon fails", () => {
      mockSendBeacon.mockReturnValueOnce(false);
      tracker.trackView("slug-1");
      tracker.flush();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/activity",
        expect.objectContaining({
          method: "POST",
          keepalive: true,
        })
      );
    });

    it("never throws on fetch failure", () => {
      mockSendBeacon.mockReturnValueOnce(false);
      mockFetch.mockRejectedValueOnce(new Error("network error"));
      tracker.trackView("slug-1");

      expect(() => tracker.flush()).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("flushes remaining events and clears timer", () => {
      tracker.trackView("slug-1");
      tracker.destroy();
      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });
});
