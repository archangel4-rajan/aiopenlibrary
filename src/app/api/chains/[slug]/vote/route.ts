/**
 * POST /api/chains/[slug]/vote — upsert a vote (like or dislike).
 * DELETE /api/chains/[slug]/vote — remove the user's vote.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  let body: { vote_type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const voteType = body.vote_type;
  if (voteType !== "like" && voteType !== "dislike") {
    return NextResponse.json(
      { error: "vote_type must be 'like' or 'dislike'" },
      { status: 400 }
    );
  }

  const chain = await getChainBySlug(slug);
  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("chain_votes")
    .upsert(
      {
        user_id: user.id,
        chain_id: chain.id,
        vote_type: voteType,
      },
      { onConflict: "user_id,chain_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vote_type: voteType });
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

  const chain = await getChainBySlug(slug);
  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("chain_votes")
    .delete()
    .eq("user_id", user.id)
    .eq("chain_id", chain.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vote_type: null });
}
