import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        display_name: null,
        avatar_url: null,
      }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, username, bio } = body;

    // Validate bio if provided
    if (bio !== undefined && typeof bio === "string" && bio.length > 200) {
      return NextResponse.json(
        { error: "Bio must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username !== undefined) {
      if (typeof username !== "string" || !/^[a-z0-9-]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username must be lowercase alphanumeric characters and hyphens only" },
          { status: 400 }
        );
      }

      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: "Username must be between 3 and 30 characters" },
          { status: 400 }
        );
      }

      // Check uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name, username, bio })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
