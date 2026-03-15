/**
 * POST /api/activity — ingest tracking events from the client.
 *
 * Accepts a single event or an array. Rate-limited to 100 events/min per IP.
 * Extracts user_id from session if authenticated.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackActivity, trackActivities, ALLOWED_EVENT_TYPES } from "@/lib/activity";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import type { ActivityEvent, EventType } from "@/lib/activity";

const activityLimiter = createRateLimiter("activity", 60_000, 100);

function isValidEventType(type: string): type is EventType {
  return (ALLOWED_EVENT_TYPES as readonly string[]).includes(type);
}

interface RawEvent {
  event_type?: string;
  session_id?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}

function validateEvent(raw: RawEvent): ActivityEvent | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.event_type || !isValidEventType(raw.event_type)) return null;
  return {
    event_type: raw.event_type,
    session_id: typeof raw.session_id === "string" ? raw.session_id : undefined,
    resource_type: typeof raw.resource_type === "string" ? raw.resource_type : undefined,
    resource_id: typeof raw.resource_id === "string" ? raw.resource_id : undefined,
    metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!activityLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Try to get the current user (optional — anonymous events are fine)
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Not authenticated — continue with null userId
  }

  // Accept { events: [...] } or { event_type, ... } for single event
  const rawEvents: RawEvent[] = [];
  if (body && typeof body === "object" && "events" in body && Array.isArray((body as { events: unknown }).events)) {
    rawEvents.push(...(body as { events: RawEvent[] }).events);
  } else {
    rawEvents.push(body as RawEvent);
  }

  const validEvents: ActivityEvent[] = [];
  for (const raw of rawEvents) {
    const validated = validateEvent(raw);
    if (validated) {
      validated.user_id = userId;
      validEvents.push(validated);
    }
  }

  if (validEvents.length === 0) {
    return NextResponse.json({ error: "No valid events" }, { status: 400 });
  }

  if (validEvents.length === 1) {
    await trackActivity(validEvents[0]);
  } else {
    await trackActivities(validEvents);
  }

  return NextResponse.json({ tracked: validEvents.length });
}
