import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description,
      category_id: body.category_id,
      category_name: body.category_name,
      category_slug: body.category_slug,
      prompt: body.prompt,
      tags: body.tags || [],
      recommended_model: body.recommended_model || "",
      model_icon: body.model_icon || "",
      use_cases: body.use_cases || [],
      references: body.references || [],
      variables: body.variables || [],
      tips: body.tips || [],
      difficulty: body.difficulty || "Intermediate",
      is_published: body.is_published ?? true,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
