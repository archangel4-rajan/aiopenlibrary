/**
 * Server-side activity tracking for analytics.
 *
 * All functions are fire-and-forget — they never throw and log
 * errors to console so tracking failures never break the app.
 */

import { createAdminClient } from "@/lib/supabase/server";

// ── Event types ────────────────────────────────────────────────
//
// resource_id conventions (consistent within each event type):
//   prompt.view / prompt.copy  → slug  (client-side, human-readable)
//   prompt.save / unsave / vote → UUID (server-side, from API route params)
//   search                     → null  (query stored in metadata)
//   page.view                  → path  (client-side, e.g. "/prompts")
//

export const ALLOWED_EVENT_TYPES = [
  "prompt.view",
  "prompt.copy",
  "prompt.save",
  "prompt.unsave",
  "prompt.vote",
  "search",
  "page.view",
] as const;

export type EventType = (typeof ALLOWED_EVENT_TYPES)[number];

export interface ActivityEvent {
  event_type: EventType;
  user_id?: string | null;
  session_id?: string | null;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: Record<string, unknown>;
}

// ── Core insert functions ──────────────────────────────────────

/** Insert a single activity event. Never throws. */
export async function trackActivity(event: ActivityEvent): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("user_activity").insert({
      event_type: event.event_type,
      user_id: event.user_id ?? null,
      session_id: event.session_id ?? null,
      resource_type: event.resource_type ?? null,
      resource_id: event.resource_id ?? null,
      metadata: event.metadata ?? {},
    });
    if (error) {
      console.error("trackActivity error:", error);
    }
  } catch (err) {
    console.error("trackActivity error:", err);
  }
}

/** Insert multiple activity events in one call. Never throws. */
export async function trackActivities(events: ActivityEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    const supabase = createAdminClient();
    const rows = events.map((e) => ({
      event_type: e.event_type,
      user_id: e.user_id ?? null,
      session_id: e.session_id ?? null,
      resource_type: e.resource_type ?? null,
      resource_id: e.resource_id ?? null,
      metadata: e.metadata ?? {},
    }));
    const { error } = await supabase.from("user_activity").insert(rows);
    if (error) {
      console.error("trackActivities error:", error);
    }
  } catch (err) {
    console.error("trackActivities error:", err);
  }
}

// ── Helper factories ───────────────────────────────────────────

export async function trackPromptView(
  slug: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "prompt.view",
    user_id: userId,
    session_id: sessionId,
    resource_type: "prompt",
    resource_id: slug,
  });
}

export async function trackPromptCopy(
  slug: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "prompt.copy",
    user_id: userId,
    session_id: sessionId,
    resource_type: "prompt",
    resource_id: slug,
  });
}

export async function trackPromptSave(
  slug: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "prompt.save",
    user_id: userId,
    session_id: sessionId,
    resource_type: "prompt",
    resource_id: slug,
  });
}

export async function trackPromptUnsave(
  slug: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "prompt.unsave",
    user_id: userId,
    session_id: sessionId,
    resource_type: "prompt",
    resource_id: slug,
  });
}

export async function trackPromptVote(
  slug: string,
  voteType: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "prompt.vote",
    user_id: userId,
    session_id: sessionId,
    resource_type: "prompt",
    resource_id: slug,
    metadata: { vote_type: voteType },
  });
}

export async function trackSearch(
  query: string,
  resultCount?: number,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "search",
    user_id: userId,
    session_id: sessionId,
    metadata: { query, result_count: resultCount },
  });
}

export async function trackPageView(
  path: string,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  return trackActivity({
    event_type: "page.view",
    user_id: userId,
    session_id: sessionId,
    resource_type: "page",
    resource_id: path,
  });
}
