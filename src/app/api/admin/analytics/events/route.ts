/**
 * GET /api/admin/analytics/events — raw event feed with pagination.
 *
 * Supports ?event_type=X&resource_id=X&limit=50&offset=0&days=30
 */

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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
  const eventType = searchParams.get("event_type") || undefined;
  const resourceId = searchParams.get("resource_id") || undefined;
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  let query = admin
    .from("user_activity")
    .select("*", { count: "exact" })
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType) {
    query = query.eq("event_type", eventType);
  }
  if (resourceId) {
    query = query.eq("resource_id", resourceId);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("GET /api/admin/analytics/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({
    events: data ?? [],
    total: count ?? 0,
    limit,
    offset,
    days,
  });
}
