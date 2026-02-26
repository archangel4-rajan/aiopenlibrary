import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedPacks } from "@/lib/db";

export async function GET() {
  const packs = await getPublishedPacks();

  // Enrich with creator info
  if (packs.length === 0) {
    return NextResponse.json(packs);
  }

  const supabase = await createClient();
  const creatorIds = [...new Set(packs.map((p) => p.creator_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", creatorIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  // Get prompt counts per pack
  const packIds = packs.map((p) => p.id);
  const { data: items } = await supabase
    .from("prompt_pack_items")
    .select("pack_id")
    .in("pack_id", packIds);

  const countMap = new Map<string, number>();
  for (const item of items ?? []) {
    countMap.set(item.pack_id, (countMap.get(item.pack_id) || 0) + 1);
  }

  const enriched = packs.map((pack) => ({
    ...pack,
    creator: profileMap.get(pack.creator_id) ?? null,
    prompt_count: countMap.get(pack.id) ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const zapPrice = typeof body.zap_price === "number" ? body.zap_price : 0;
  const promptIds = Array.isArray(body.prompt_ids) ? body.prompt_ids : [];
  const isPublished = typeof body.is_published === "boolean" ? body.is_published : true;

  // Validate
  if (name.length < 2 || name.length > 200) {
    return NextResponse.json({ error: "Name must be 2-200 characters" }, { status: 400 });
  }
  if (description.length < 10) {
    return NextResponse.json({ error: "Description must be at least 10 characters" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 2) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (zapPrice <= 0) {
    return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
  }
  if (promptIds.length === 0) {
    return NextResponse.json({ error: "Pack must contain at least one prompt" }, { status: 400 });
  }

  // Verify all prompt_ids are owned by this creator
  const { data: ownedPrompts, error: ownedError } = await supabase
    .from("prompts")
    .select("id")
    .eq("created_by", user.id)
    .in("id", promptIds);

  if (ownedError || !ownedPrompts || ownedPrompts.length !== promptIds.length) {
    return NextResponse.json({ error: "All prompts must be owned by you" }, { status: 400 });
  }

  // Insert pack
  const { data: pack, error: packError } = await supabase
    .from("prompt_packs")
    .insert({
      creator_id: user.id,
      name,
      description,
      slug,
      zap_price: zapPrice,
      is_published: isPublished,
    })
    .select()
    .single();

  if (packError) {
    if (packError.code === "23505") {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: packError.message }, { status: 500 });
  }

  // Insert pack items
  const packItems = promptIds.map((promptId: string, index: number) => ({
    pack_id: pack.id,
    prompt_id: promptId,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from("prompt_pack_items")
    .insert(packItems);

  if (itemsError) {
    // Rollback pack creation
    await supabase.from("prompt_packs").delete().eq("id", pack.id);
    return NextResponse.json({ error: "Failed to add prompts to pack" }, { status: 500 });
  }

  return NextResponse.json(pack, { status: 201 });
}
