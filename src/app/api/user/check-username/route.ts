import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(username)) {
      return NextResponse.json({ available: false, error: "Invalid format" });
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ available: false, error: "Must be 3-30 characters" });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ available: !existing });
  } catch (err) {
    console.error("GET /api/user/check-username error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
