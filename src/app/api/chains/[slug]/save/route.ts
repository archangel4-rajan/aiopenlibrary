/**
 * POST /api/chains/[slug]/save — save a chain.
 * DELETE /api/chains/[slug]/save — unsave a chain.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveLimiter } from "@/lib/rate-limit";
import { getChainBySlug } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!saveLimiter.check(user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const chain = await getChainBySlug(slug);
  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  const { error } = await supabase.from("saved_chains").insert({
    user_id: user.id,
    chain_id: chain.id,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ saved: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update saves_count
  await supabase
    .from("prompt_chains")
    .update({ saves_count: chain.saves_count + 1 })
    .eq("id", chain.id);

  return NextResponse.json({ saved: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!saveLimiter.check(user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const chain = await getChainBySlug(slug);
  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("saved_chains")
    .delete()
    .eq("user_id", user.id)
    .eq("chain_id", chain.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update saves_count
  await supabase
    .from("prompt_chains")
    .update({ saves_count: Math.max(0, chain.saves_count - 1) })
    .eq("id", chain.id);

  return NextResponse.json({ saved: false });
}
