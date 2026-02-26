/**
 * GET  /api/prompts/[id]/comments — fetch all comments for a prompt (public).
 * POST /api/prompts/[id]/comments — add a comment or reply (auth required).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCommentsByPromptId } from "@/lib/db";
import { commentLimiter } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getCommentsByPromptId(id);
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!commentLimiter.check(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body: { content?: string; parent_id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (content.length === 0 || content.length > 2000) {
      return NextResponse.json(
        { error: "Content must be between 1 and 2000 characters" },
        { status: 400 }
      );
    }

    const parentId = body.parent_id || null;

    // If replying to a parent comment, validate it
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from("prompt_comments")
        .select("id, parent_id")
        .eq("id", parentId)
        .eq("prompt_id", id)
        .single();

      if (parentError || !parent) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 400 }
        );
      }

      if (parent.parent_id) {
        return NextResponse.json(
          { error: "Cannot reply to a reply" },
          { status: 400 }
        );
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from("prompt_comments")
      .insert({
        prompt_id: id,
        user_id: user.id,
        content,
        parent_id: parentId,
      })
      .select(
        "*, profiles!prompt_comments_user_id_fkey(display_name, avatar_url, username)"
      )
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create comment" },
        { status: 500 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = inserted as any;
    const comment = {
      id: c.id,
      prompt_id: c.prompt_id,
      user_id: c.user_id,
      content: c.content,
      parent_id: c.parent_id,
      is_deleted: c.is_deleted,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: {
        display_name: c.profiles?.display_name ?? null,
        avatar_url: c.profiles?.avatar_url ?? null,
        username: c.profiles?.username ?? null,
      },
      replies: [],
    };

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
