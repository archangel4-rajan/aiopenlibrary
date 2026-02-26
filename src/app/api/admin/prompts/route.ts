import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validatePromptBody } from "@/lib/prompt-validation";

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
      is_premium: body.is_premium ?? false,
      premium_preview_length: body.premium_preview_length ?? null,
      zap_price: body.zap_price ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
