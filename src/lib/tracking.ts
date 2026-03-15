"use client";

/**
 * Client-side activity tracker.
 *
 * Batches events and flushes every 5 seconds or on page unload.
 * Never blocks UI, never throws. Deduplicates rapid duplicate events.
 */

import type { EventType } from "@/lib/activity";

interface ClientEvent {
  event_type: EventType;
  session_id: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: Record<string, unknown>;
}

const FLUSH_INTERVAL_MS = 5_000;
const DEDUP_WINDOW_MS = 2_000;

/** Generate or retrieve a session ID from sessionStorage. */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "aiol_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export class ClientTracker {
  private queue: ClientEvent[] = [];
  private recentKeys = new Map<string, number>();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = getSessionId();
    this.startFlushTimer();
    this.registerUnloadHandler();
  }

  // ── Public tracking methods ────────────────────────────────

  trackView(slug: string): void {
    this.enqueue("prompt.view", "prompt", slug);
  }

  trackCopy(slug: string): void {
    this.enqueue("prompt.copy", "prompt", slug);
  }

  trackSearch(query: string): void {
    this.enqueue("search", undefined, undefined, { query });
  }

  trackPageView(path: string): void {
    this.enqueue("page.view", "page", path);
  }

  // ── Internals ──────────────────────────────────────────────

  private enqueue(
    eventType: EventType,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): void {
    // Deduplicate rapid identical events
    const key = `${eventType}:${resourceId ?? ""}`;
    const now = Date.now();
    const lastSeen = this.recentKeys.get(key);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return;
    this.recentKeys.set(key, now);

    this.queue.push({
      event_type: eventType,
      session_id: this.sessionId,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
      metadata: metadata ?? {},
    });
  }

  /** Flush queued events to the server. */
  flush(): void {
    if (this.queue.length === 0) return;

    const events = this.queue.splice(0);
    const body = JSON.stringify({ events });

    // Prefer sendBeacon for unload scenarios; fall back to fetch
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        "/api/activity",
        new Blob([body], { type: "application/json" })
      );
      if (!sent) {
        // sendBeacon failed, try fetch fire-and-forget
        this.fetchSend(body);
      }
    } else {
      this.fetchSend(body);
    }

    // Prune old dedup keys
    const now = Date.now();
    for (const [k, ts] of this.recentKeys) {
      if (now - ts > DEDUP_WINDOW_MS * 2) this.recentKeys.delete(k);
    }
  }

  private fetchSend(body: string): void {
    try {
      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently ignore — tracking should never break the app
      });
    } catch {
      // Silently ignore
    }
  }

  private startFlushTimer(): void {
    if (typeof window === "undefined") return;
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  private registerUnloadHandler(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flush();
    });
  }

  destroy(): void {
    this.flush();
    if (this.flushTimer) clearInterval(this.flushTimer);
  }
}
