import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const user = await checkAdmin(supabase);
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("prompts")
      .update({
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
        is_premium: body.is_premium ?? false,
        premium_preview_length: body.premium_preview_length ?? null,
        zap_price: body.zap_price ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/admin/prompts/[id] error:", { userId: user.id, promptId: id, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT /api/admin/prompts/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const user = await checkAdmin(supabase);
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("prompts").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/admin/prompts/[id] error:", { userId: user.id, promptId: id, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/admin/prompts/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
