/**
 * GET /api/chains — list published chains with optional filters.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = await createClient();

    let query = supabase
      .from("prompt_chains")
      .select("*, profiles!prompt_chains_created_by_fkey(display_name, username, avatar_url)")
      .eq("is_published", true);

    if (category) {
      query = query.eq("category_slug", category);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data: chains, error } = await query
      .order("saves_count", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get step counts for each chain
    const chainIds = (chains ?? []).map((c) => c.id);
    let stepCounts: Record<string, number> = {};

    if (chainIds.length > 0) {
      const { data: steps } = await supabase
        .from("prompt_chain_steps")
        .select("chain_id")
        .in("chain_id", chainIds);

      if (steps) {
        for (const s of steps) {
          stepCounts[s.chain_id] = (stepCounts[s.chain_id] || 0) + 1;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (chains ?? []).map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      category_id: c.category_id,
      category_name: c.category_name,
      category_slug: c.category_slug,
      tags: c.tags,
      difficulty: c.difficulty,
      estimated_minutes: c.estimated_minutes,
      use_cases: c.use_cases,
      is_premium: c.is_premium,
      zap_price: c.zap_price,
      saves_count: c.saves_count,
      likes_count: c.likes_count,
      dislikes_count: c.dislikes_count,
      is_published: c.is_published,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      step_count: stepCounts[c.id] || 0,
      creator: c.profiles
        ? {
            display_name: c.profiles.display_name,
            username: c.profiles.username,
            avatar_url: c.profiles.avatar_url,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chains" },
      { status: 500 }
    );
  }
}
