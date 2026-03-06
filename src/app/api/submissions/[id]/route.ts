import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { submissionLimiter } from "@/lib/rate-limit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_submissions")
      .select("*")
      .eq("id", id)
      .eq("submitted_by", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Verify the submission belongs to this user and is a draft
    const { data: existing, error: fetchError } = await supabase
      .from("prompt_submissions")
      .select("id, submitted_by, status")
      .eq("id", id)
      .eq("submitted_by", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft submissions can be edited" },
        { status: 400 }
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
      status: reqStatus,
    } = body;

    const newStatus = reqStatus === "pending" ? "pending" : "draft";

    // When submitting (changing to pending), validate all required fields
    if (newStatus === "pending") {
      if (!title || !description || !category_id || !prompt) {
        return NextResponse.json(
          { error: "Title, description, category, and prompt are required" },
          { status: 400 }
        );
      }

      if (!submissionLimiter.check(user.id)) {
        return NextResponse.json(
          { error: "Too many submissions. Please try again later." },
          { status: 429 }
        );
      }
    }

    const { data, error } = await supabase
      .from("prompt_submissions")
      .update({
        title: title || existing.status,
        description: description || "",
        category_id: category_id || null,
        category_name: category_name || "",
        category_slug: category_slug || "",
        prompt: prompt || "",
        tags: tags || [],
        recommended_model: recommended_model || "",
        model_icon: model_icon || "",
        submitter_email: submitter_email || "",
        status: newStatus,
      })
      .eq("id", id)
      .eq("submitted_by", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating submission:", error);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
