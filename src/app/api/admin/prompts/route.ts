import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function validatePromptBody(body: Record<string, unknown>): string | null {
  if (!body.slug || typeof body.slug !== "string" || body.slug.length < 2 || body.slug.length > 200) {
    return "slug is required and must be 2-200 characters";
  }
  if (!/^[a-z0-9-]+$/.test(body.slug as string)) {
    return "slug must contain only lowercase letters, numbers, and hyphens";
  }
  if (!body.title || typeof body.title !== "string" || body.title.length < 2 || body.title.length > 300) {
    return "title is required and must be 2-300 characters";
  }
  if (!body.description || typeof body.description !== "string" || body.description.length < 10) {
    return "description is required and must be at least 10 characters";
  }
  if (!body.prompt || typeof body.prompt !== "string" || body.prompt.length < 20) {
    return "prompt text is required and must be at least 20 characters";
  }
  if (!body.category_id || typeof body.category_id !== "string") {
    return "category_id is required";
  }
  if (body.tags && !Array.isArray(body.tags)) {
    return "tags must be an array";
  }
  if (body.difficulty && !["Beginner", "Intermediate", "Advanced"].includes(body.difficulty as string)) {
    return "difficulty must be Beginner, Intermediate, or Advanced";
  }
  return null;
}

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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validatePromptBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      slug: (body.slug as string).trim(),
      title: (body.title as string).trim(),
      description: (body.description as string).trim(),
      category_id: body.category_id,
      category_name: body.category_name || "",
      category_slug: body.category_slug || "",
      prompt: (body.prompt as string).trim(),
      tags: Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
      recommended_model: typeof body.recommended_model === "string" ? body.recommended_model : "",
      model_icon: typeof body.model_icon === "string" ? body.model_icon : "",
      use_cases: Array.isArray(body.use_cases) ? body.use_cases : [],
      references: Array.isArray(body.references) ? body.references : [],
      variables: Array.isArray(body.variables) ? body.variables : [],
      tips: Array.isArray(body.tips) ? body.tips : [],
      difficulty: (body.difficulty as string) || "Intermediate",
      is_published: typeof body.is_published === "boolean" ? body.is_published : true,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
