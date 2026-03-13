import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { display_name, username, bio, banner_url, website_url, location } = body as {
      display_name?: string;
      username?: string;
      bio?: string;
      banner_url?: string;
      website_url?: string;
      location?: string;
    };

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

    // Validate website_url if provided
    if (website_url !== undefined && website_url !== null && website_url !== "") {
      if (typeof website_url !== "string" || !website_url.startsWith("https://")) {
        return NextResponse.json(
          { error: "Website URL must start with https://" },
          { status: 400 }
        );
      }
    }

    // Validate location if provided
    if (location !== undefined && typeof location === "string" && location.length > 100) {
      return NextResponse.json(
        { error: "Location must be 100 characters or less" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name, username, bio, banner_url, website_url, location })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/user/profile error:", { userId: user.id, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
