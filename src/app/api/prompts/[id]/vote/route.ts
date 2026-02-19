/**
 * POST /api/prompts/[id]/vote — upsert a vote (like or dislike).
 * DELETE /api/prompts/[id]/vote — remove the user's vote.
 *
 * Body for POST: { "vote_type": "like" | "dislike" }
 *
 * The trigger `update_vote_counts` on `prompt_votes` keeps the
 * denormalised `likes_count` / `dislikes_count` on `prompts` in sync.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  // Upsert: if a vote exists, update; otherwise insert.
  const { error } = await supabase
    .from("prompt_votes")
    .upsert(
      {
        user_id: user.id,
        prompt_id: id,
        vote_type: voteType,
      },
      { onConflict: "user_id,prompt_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vote_type: voteType });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("prompt_votes")
    .delete()
    .eq("user_id", user.id)
    .eq("prompt_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vote_type: null });
}
