/**
 * GET /api/admin/analytics/overview — high-level activity stats.
 *
 * Returns total events, unique users/sessions, events by type,
 * and events by day for the last N days (default 30).
 */

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Auth check — must be admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  // Total events
  const { count: totalEvents } = await admin
    .from("user_activity")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  // Unique users (non-null)
  const { data: usersData } = await admin
    .from("user_activity")
    .select("user_id")
    .not("user_id", "is", null)
    .gte("created_at", since.toISOString());

  const uniqueUsers = new Set(usersData?.map((r: { user_id: string }) => r.user_id)).size;

  // Unique sessions
  const { data: sessionsData } = await admin
    .from("user_activity")
    .select("session_id")
    .not("session_id", "is", null)
    .gte("created_at", since.toISOString());

  const uniqueSessions = new Set(sessionsData?.map((r: { session_id: string }) => r.session_id)).size;

  // Events by type
  const { data: allEvents } = await admin
    .from("user_activity")
    .select("event_type, created_at")
    .gte("created_at", since.toISOString());

  const byType: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const row of allEvents ?? []) {
    byType[row.event_type] = (byType[row.event_type] || 0) + 1;
    const day = row.created_at.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  // Sort byDay chronologically
  const eventsByDay = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    total_events: totalEvents ?? 0,
    unique_users: uniqueUsers,
    unique_sessions: uniqueSessions,
    events_by_type: byType,
    events_by_day: eventsByDay,
    days,
  });
}
