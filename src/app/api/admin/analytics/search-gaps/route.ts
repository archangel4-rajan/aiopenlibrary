/**
 * GET /api/admin/analytics/search-gaps — unmet search demand.
 *
 * Returns queries that returned 0 or few results, grouped and ranked by frequency.
 * Designed to be consumed by the prompt seeding cron job to prioritize
 * creating prompts for topics users are actually looking for.
 *
 * Supports ?days=30&min_count=2&max_results=5
 * - days: lookback window (default 30)
 * - min_count: minimum times searched to be included (default 2, filters noise)
 * - max_results: only include searches where result_count <= this (default 5)
 */

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Admin auth check
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
  const minCount = Math.max(parseInt(searchParams.get("min_count") || "2", 10) || 2, 1);
  const maxResults = Math.max(parseInt(searchParams.get("max_results") || "5", 10) || 5, 0);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  const { data } = await admin
    .from("user_activity")
    .select("metadata")
    .eq("event_type", "search")
    .gte("created_at", since.toISOString());

  // Aggregate: group by normalized query, track result counts
  const queryStats = new Map<string, { count: number; avgResults: number; totalResults: number; zeroCount: number }>();

  for (const row of data ?? []) {
    const meta = row.metadata as { query?: string; result_count?: number };
    if (!meta?.query || typeof meta.query !== "string") continue;

    const normalized = meta.query.toLowerCase().trim();
    if (normalized.length < 2) continue; // skip single chars

    const existing = queryStats.get(normalized) || { count: 0, avgResults: 0, totalResults: 0, zeroCount: 0 };
    existing.count++;
    const resultCount = typeof meta.result_count === "number" ? meta.result_count : 0;
    existing.totalResults += resultCount;
    existing.avgResults = existing.totalResults / existing.count;
    if (resultCount === 0) existing.zeroCount++;
    queryStats.set(normalized, existing);
  }

  // Filter to low/zero result queries that meet minimum search count
  const gaps = [...queryStats.entries()]
    .filter(([, stats]) => stats.count >= minCount && stats.avgResults <= maxResults)
    .sort((a, b) => {
      // Prioritize: zero results first, then by search frequency
      if (a[1].zeroCount > 0 && b[1].zeroCount === 0) return -1;
      if (a[1].zeroCount === 0 && b[1].zeroCount > 0) return 1;
      return b[1].count - a[1].count;
    })
    .slice(0, 50)
    .map(([query, stats]) => ({
      query,
      search_count: stats.count,
      avg_results: Math.round(stats.avgResults * 10) / 10,
      zero_result_count: stats.zeroCount,
    }));

  return NextResponse.json({
    gaps,
    total_searches: data?.length ?? 0,
    days,
    min_count: minCount,
    max_results: maxResults,
  });
}
