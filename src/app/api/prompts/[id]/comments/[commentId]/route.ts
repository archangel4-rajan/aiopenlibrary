/**
 * DELETE /api/prompts/[id]/comments/[commentId] — soft-delete a comment (auth required).
 *
 * The user must be the comment author or an admin.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the comment to verify existence and ownership
    const { data: comment, error: fetchError } = await supabase
      .from("prompt_comments")
      .select("id, user_id, prompt_id")
      .eq("id", commentId)
      .eq("prompt_id", id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin role
    if (comment.user_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Soft-delete the comment
    const { error: updateError } = await supabase
      .from("prompt_comments")
      .update({ is_deleted: true })
      .eq("id", commentId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
