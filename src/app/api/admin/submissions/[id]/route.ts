import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/db";

async function checkAdmin() {
  const user = await getUser();
  if (!user) return null;
  const profile = await getUserProfile(user.id);
  if (profile?.role !== "admin") return null;
  return user;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (status === "approved") {
      // Fetch the submission first
      const { data: submission, error: fetchError } = await supabase
        .from("prompt_submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      // Create a slug from the title
      const slug = submission.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Insert into prompts table
      const { error: insertError } = await supabase.from("prompts").insert({
        slug,
        title: submission.title,
        description: submission.description,
        category_id: submission.category_id,
        category_name: submission.category_name,
        category_slug: submission.category_slug,
        prompt: submission.prompt,
        tags: submission.tags,
        recommended_model: submission.recommended_model,
        model_icon: submission.model_icon,
        is_published: true,
        created_by: submission.submitted_by,
      });

      if (insertError) {
        console.error("Error creating prompt from submission:", insertError);
        return NextResponse.json(
          { error: "Failed to create prompt" },
          { status: 500 }
        );
      }
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from("prompt_submissions")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating submission:", updateError);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
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
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("prompt_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
