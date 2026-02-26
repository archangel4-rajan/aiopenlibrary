import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPackBySlug, getPackById, getPackItems } from "@/lib/db";

// UUID v4 pattern for distinguishing IDs from slugs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;

  // Determine if this is an ID or slug lookup
  const pack = UUID_REGEX.test(param)
    ? await getPackById(param)
    : await getPackBySlug(param);

  if (!pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Get prompts in the pack (titles + descriptions, not full text unless purchased)
  const prompts = await getPackItems(pack.id);

  // Get creator info
  const supabase = await createClient();
  const { data: creator } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .eq("id", pack.creator_id)
    .single();

  // Check if current user has purchased
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPurchased = false;
  if (user) {
    const { data: purchase } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("pack_id", pack.id)
      .maybeSingle();
    isPurchased = !!purchase;
  }

  // Calculate individual total price
  const individualTotal = prompts.reduce((sum, p) => sum + (p.zap_price ?? 0), 0);

  const packPrompts = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    zap_price: p.zap_price,
    category_name: p.category_name,
    is_premium: p.is_premium,
  }));

  return NextResponse.json({
    ...pack,
    creator: creator ?? null,
    prompts: packPrompts,
    prompt_count: prompts.length,
    individual_total: individualTotal,
    is_purchased: isPurchased,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check creator/admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the pack
  const pack = await getPackById(param);
  if (!pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Ownership check
  if (pack.creator_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Update pack
  const { data: updated, error } = await supabase
    .from("prompt_packs")
    .update({
      name: body.name ?? pack.name,
      description: body.description ?? pack.description,
      zap_price: body.zap_price ?? pack.zap_price,
      is_published: body.is_published ?? pack.is_published,
    })
    .eq("id", pack.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update prompt_ids if provided
  if (Array.isArray(body.prompt_ids)) {
    // Verify ownership
    const { data: ownedPrompts } = await supabase
      .from("prompts")
      .select("id")
      .eq("created_by", user.id)
      .in("id", body.prompt_ids);

    if (!ownedPrompts || ownedPrompts.length !== body.prompt_ids.length) {
      return NextResponse.json({ error: "All prompts must be owned by you" }, { status: 400 });
    }

    // Replace pack items
    await supabase.from("prompt_pack_items").delete().eq("pack_id", pack.id);
    const packItems = body.prompt_ids.map((promptId: string, index: number) => ({
      pack_id: pack.id,
      prompt_id: promptId,
      sort_order: index,
    }));
    await supabase.from("prompt_pack_items").insert(packItems);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check creator/admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pack = await getPackById(param);
  if (!pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Ownership check
  if (pack.creator_id !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete pack items first, then pack
  await supabase.from("prompt_pack_items").delete().eq("pack_id", pack.id);
  const { error } = await supabase.from("prompt_packs").delete().eq("id", pack.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
