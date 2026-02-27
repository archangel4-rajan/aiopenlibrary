/**
 * DELETE /api/chains/[slug]/comments/[commentId] — soft-delete a comment (auth required).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChainBySlug } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const { slug, commentId } = await params;
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

    // Fetch the comment to verify existence and ownership
    const { data: comment, error: fetchError } = await supabase
      .from("chain_comments")
      .select("id, user_id, chain_id")
      .eq("id", commentId)
      .eq("chain_id", chain.id)
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
      .from("chain_comments")
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
