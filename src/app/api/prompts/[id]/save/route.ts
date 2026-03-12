import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveLimiter } from "@/lib/rate-limit";

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

    if (!saveLimiter.check(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { error } = await supabase.from("saved_prompts").insert({
      user_id: user.id,
      prompt_id: id,
    });

    if (error) {
      // Unique constraint violation means already saved
      if (error.code === "23505") {
        return NextResponse.json({ saved: true });
      }
      console.error("POST /api/prompts/[id]/save error:", { userId: user.id, promptId: id, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("POST /api/prompts/[id]/save error:", err);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!saveLimiter.check(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { error } = await supabase
      .from("saved_prompts")
      .delete()
      .eq("user_id", user.id)
      .eq("prompt_id", id);

    if (error) {
      console.error("DELETE /api/prompts/[id]/save error:", { userId: user.id, promptId: id, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ saved: false });
  } catch (err) {
    console.error("DELETE /api/prompts/[id]/save error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
