import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const limiter = createRateLimiter("test-under", 60_000, 3);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const limiter = createRateLimiter("test-over", 60_000, 2);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(false);
  });

  it("tracks different identifiers independently", () => {
    const limiter = createRateLimiter("test-independent", 60_000, 1);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(false);
    expect(limiter.check("user2")).toBe(true); // different user still allowed
  });

  it("resets after the window expires", () => {
    const limiter = createRateLimiter("test-reset", 60_000, 1);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(limiter.check("user1")).toBe(true); // allowed again
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when no header present", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});
