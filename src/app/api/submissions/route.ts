import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { submissionLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!submissionLimiter.check(user.id)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category_id,
      category_name,
      category_slug,
      prompt,
      tags,
      recommended_model,
      model_icon,
      submitter_email,
    } = body;

    if (!title || !description || !category_id || !prompt) {
      return NextResponse.json(
        { error: "Title, description, category, and prompt are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_submissions")
      .insert({
        title,
        description,
        category_id,
        category_name,
        category_slug,
        prompt,
        tags: tags || [],
        recommended_model: recommended_model || "",
        model_icon: model_icon || "",
        submitter_email: submitter_email || user.email || "",
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating submission:", error);
      return NextResponse.json(
        { error: "Failed to submit prompt" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
