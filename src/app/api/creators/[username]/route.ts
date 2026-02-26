import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .eq("created_by", profile.id)
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (promptsError) {
      return NextResponse.json(
        { error: promptsError.message },
        { status: 500 }
      );
    }

    const totalPrompts = prompts?.length ?? 0;
    const totalSaves = prompts?.reduce((sum, p) => sum + (p.saves_count || 0), 0) ?? 0;
    const totalLikes = prompts?.reduce((sum, p) => sum + (p.likes_count || 0), 0) ?? 0;

    return NextResponse.json({
      profile,
      prompts: prompts ?? [],
      stats: {
        totalPrompts,
        totalSaves,
        totalLikes,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
