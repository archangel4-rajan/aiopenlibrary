/**
 * Lightweight in-memory rate limiter using a sliding window.
 *
 * Tracks request counts per identifier (IP or user ID) within a
 * configurable time window. State resets on server restart, which
 * is acceptable for this scale — upgrade to Redis if needed later.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Create a named rate limiter with a fixed window.
 *
 * @param name      Unique name for this limiter (e.g. "search", "save")
 * @param windowMs  Time window in milliseconds (default: 60 000 = 1 min)
 * @param max       Maximum requests allowed in the window (default: 30)
 */
export function createRateLimiter(
  name: string,
  windowMs: number = 60_000,
  max: number = 30
) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  return {
    /**
     * Check whether the identifier is allowed to make a request.
     * Returns `true` if under the limit, `false` if rate-limited.
     */
    check(identifier: string): boolean {
      const now = Date.now();
      const entry = store.get(identifier);

      // First request or window expired → reset
      if (!entry || now > entry.resetTime) {
        store.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }

      // Under the limit → increment
      if (entry.count < max) {
        entry.count++;
        return true;
      }

      // Over the limit
      return false;
    },

    /** Evict expired entries to prevent memory leaks in long-running servers. */
    cleanup() {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now > entry.resetTime) {
          store.delete(key);
        }
      }
    },
  };
}

// ── Pre-configured limiters for API routes ──────────────────────

/** Search: 30 requests per minute per IP */
export const searchLimiter = createRateLimiter("search", 60_000, 30);

/** Submissions: 5 per hour per user */
export const submissionLimiter = createRateLimiter("submissions", 3_600_000, 5);

/** Save/unsave toggle: 60 per minute per user */
export const saveLimiter = createRateLimiter("save", 60_000, 60);

/** Comments: 10 per hour per user */
export const commentLimiter = createRateLimiter("comments", 3_600_000, 10);

/**
 * Extract a client identifier from a request.
 * Uses X-Forwarded-For (set by Vercel/reverse proxies) or falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
