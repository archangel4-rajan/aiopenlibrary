import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  // Get prompt IDs in this collection
  const { data, error } = await supabase
    .from("collection_prompts")
    .select("prompt_id")
    .eq("collection_id", id)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const promptIds = (data ?? []).map((r) => r.prompt_id);
  return NextResponse.json(promptIds);
}

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

  let body: { prompt_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { prompt_id } = body;

  if (!prompt_id) {
    return NextResponse.json(
      { error: "prompt_id is required" },
      { status: 400 }
    );
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

  const { error } = await supabase.from("collection_prompts").insert({
    collection_id: id,
    prompt_id,
  });

  if (error) {
    // Unique constraint violation means prompt already in collection
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Prompt already in collection" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
