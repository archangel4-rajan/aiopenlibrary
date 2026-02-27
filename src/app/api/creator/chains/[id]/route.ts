/**
 * PUT    /api/creator/chains/[id] — update a chain and its steps.
 * DELETE /api/creator/chains/[id] — delete a chain.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkCreatorOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  chainId: string
) {
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

  const { data: chain } = await supabase
    .from("prompt_chains")
    .select("created_by")
    .eq("id", chainId)
    .single();

  if (!chain) return null;

  // Admin can edit any chain; creators can only edit their own
  if (profile?.role !== "admin" && chain.created_by !== user.id) return null;

  return { user, isAdmin: profile?.role === "admin" };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const auth = await checkCreatorOwnership(supabase, id);
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate
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

  // Validate prompt ownership (unless admin)
  const steps = body.steps as Array<Record<string, unknown>>;
  const promptIds = steps.map((s) => s.prompt_id as string).filter(Boolean);

  if (!auth.isAdmin) {
    const { data: ownedPrompts } = await supabase
      .from("prompts")
      .select("id")
      .eq("created_by", auth.user.id)
      .in("id", promptIds);

    const ownedIds = new Set((ownedPrompts ?? []).map((p) => p.id));
    for (const pid of promptIds) {
      if (!ownedIds.has(pid)) {
        return NextResponse.json({ error: `Prompt ${pid} is not owned by you` }, { status: 403 });
      }
    }
  }

  // Update chain
  const { data: chain, error: chainError } = await supabase
    .from("prompt_chains")
    .update({
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
    })
    .eq("id", id)
    .select()
    .single();

  if (chainError) {
    return NextResponse.json({ error: chainError.message }, { status: 500 });
  }

  // Replace steps: delete old, insert new
  await supabase.from("prompt_chain_steps").delete().eq("chain_id", id);

  const stepRows = steps.map((s, i) => ({
    chain_id: id,
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
    return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }

  return NextResponse.json(chain);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const auth = await checkCreatorOwnership(supabase, id);
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("prompt_chains").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
