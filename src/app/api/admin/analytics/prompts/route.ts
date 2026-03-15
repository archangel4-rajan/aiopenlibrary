/**
 * GET /api/admin/analytics/prompts — top prompts by views, copies, saves.
 *
 * Supports ?event_type=prompt.view&limit=20&days=30
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
  const eventType = searchParams.get("event_type") || "prompt.view";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  const { data } = await admin
    .from("user_activity")
    .select("resource_id")
    .eq("event_type", eventType)
    .eq("resource_type", "prompt")
    .not("resource_id", "is", null)
    .gte("created_at", since.toISOString());

  // Aggregate counts client-side (Supabase JS doesn't support GROUP BY)
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.resource_id] = (counts[row.resource_id] || 0) + 1;
  }

  const prompts = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([resource_id, count]) => ({ resource_id, count }));

  return NextResponse.json({ prompts, event_type: eventType, days });
}
