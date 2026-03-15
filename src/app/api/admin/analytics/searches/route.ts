/**
 * GET /api/admin/analytics/searches — top search queries and zero-result queries.
 *
 * Supports ?limit=20&days=30
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
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  const { data } = await admin
    .from("user_activity")
    .select("metadata")
    .eq("event_type", "search")
    .gte("created_at", since.toISOString());

  // Aggregate query counts and identify zero-result searches
  const queryCounts: Record<string, number> = {};
  const zeroResultCounts: Record<string, number> = {};

  for (const row of data ?? []) {
    const meta = row.metadata as { query?: string; result_count?: number };
    const query = meta?.query;
    if (!query || typeof query !== "string") continue;

    const normalized = query.toLowerCase().trim();
    queryCounts[normalized] = (queryCounts[normalized] || 0) + 1;

    if (meta.result_count === 0) {
      zeroResultCounts[normalized] = (zeroResultCounts[normalized] || 0) + 1;
    }
  }

  const topSearches = Object.entries(queryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));

  const zeroResultSearches = Object.entries(zeroResultCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));

  return NextResponse.json({ top_searches: topSearches, zero_result_searches: zeroResultSearches, days });
}
