/**
 * GET  /api/creator/chains — list creator's own chains.
 * POST /api/creator/chains — create a new chain with steps.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkCreator(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator" && profile?.role !== "admin") return null;
  return { user, isAdmin: profile?.role === "admin" };
}

export async function GET() {
  const supabase = await createClient();
  const auth = await checkCreator(supabase);
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("prompt_chains")
    .select("*")
    .eq("created_by", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get step counts
  const chainIds = (data ?? []).map((c) => c.id);
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

  const result = (data ?? []).map((c) => ({
    ...c,
    step_count: stepCounts[c.id] || 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await checkCreator(supabase);
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (!body.title || typeof body.title !== "string" || body.title.length < 3 || body.title.length > 200) {
    return NextResponse.json({ error: "title is required and must be 3-200 characters" }, { status: 400 });
  }
  if (!body.description || typeof body.description !== "string" || body.description.length < 10) {
    return NextResponse.json({ error: "description is required and must be at least 10 characters" }, { status: 400 });
  }
  if (!body.slug || typeof body.slug !== "string" || body.slug.length < 3) {
    return NextResponse.json({ error: "slug is required and must be at least 3 characters" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(body.slug as string)) {
    return NextResponse.json({ error: "slug must contain only lowercase letters, numbers, and hyphens" }, { status: 400 });
  }
  if (!Array.isArray(body.steps) || body.steps.length === 0) {
    return NextResponse.json({ error: "At least one step is required" }, { status: 400 });
  }
  if (body.difficulty && !["Beginner", "Intermediate", "Advanced"].includes(body.difficulty as string)) {
    return NextResponse.json({ error: "difficulty must be Beginner, Intermediate, or Advanced" }, { status: 400 });
  }

  // Validate all step prompt_ids are owned by the user (unless admin)
  const steps = body.steps as Array<Record<string, unknown>>;
  const promptIds = steps.map((s) => s.prompt_id as string).filter(Boolean);

  if (promptIds.length !== steps.length) {
    return NextResponse.json({ error: "Each step must have a prompt_id" }, { status: 400 });
  }

  if (!auth.isAdmin) {
    const { data: ownedPrompts, error: promptError } = await supabase
      .from("prompts")
      .select("id")
      .eq("created_by", auth.user.id)
      .in("id", promptIds);

    if (promptError) {
      return NextResponse.json({ error: "Failed to validate prompts" }, { status: 500 });
    }

    const ownedIds = new Set((ownedPrompts ?? []).map((p) => p.id));
    for (const pid of promptIds) {
      if (!ownedIds.has(pid)) {
        return NextResponse.json({ error: `Prompt ${pid} is not owned by you` }, { status: 403 });
      }
    }
  }

  // Insert chain
  const { data: chain, error: chainError } = await supabase
    .from("prompt_chains")
    .insert({
      slug: (body.slug as string).trim(),
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      category_id: body.category_id || null,
      category_name: body.category_name || null,
      category_slug: body.category_slug || null,
      tags: Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
      difficulty: (body.difficulty as string) || "Intermediate",
      estimated_minutes: typeof body.estimated_minutes === "number" ? body.estimated_minutes : null,
      use_cases: Array.isArray(body.use_cases) ? body.use_cases : [],
      is_premium: body.is_premium ?? false,
      zap_price: body.zap_price ?? null,
      is_published: typeof body.is_published === "boolean" ? body.is_published : true,
      created_by: auth.user.id,
    })
    .select()
    .single();

  if (chainError || !chain) {
    return NextResponse.json({ error: chainError?.message ?? "Failed to create chain" }, { status: 500 });
  }

  // Insert steps
  const stepRows = steps.map((s, i) => ({
    chain_id: chain.id,
    prompt_id: s.prompt_id as string,
    step_number: typeof s.step_number === "number" ? s.step_number : i + 1,
    title_override: (s.title_override as string) || null,
    input_instructions: (s.input_instructions as string) || null,
    context_note: (s.context_note as string) || null,
    estimated_minutes: typeof s.estimated_minutes === "number" ? s.estimated_minutes : null,
  }));

  const { error: stepsError } = await supabase
    .from("prompt_chain_steps")
    .insert(stepRows);

  if (stepsError) {
    // Rollback: delete the chain
    await supabase.from("prompt_chains").delete().eq("id", chain.id);
    return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }

  return NextResponse.json(chain, { status: 201 });
}
