import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; promptId: string }> }
) {
  const { id, promptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify that the user owns this collection
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (collectionError || !collection) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from("collection_prompts")
    .delete()
    .eq("collection_id", id)
    .eq("prompt_id", promptId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
