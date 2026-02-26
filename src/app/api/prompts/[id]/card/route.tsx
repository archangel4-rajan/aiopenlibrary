import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: prompt, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error || !prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "800px",
            height: "418px",
            backgroundColor: "#1c1917",
            padding: "48px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                display: "flex",
                backgroundColor: "#44403c",
                color: "#d6d3d1",
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              {prompt.category_name}
            </span>
            <span
              style={{
                display: "flex",
                backgroundColor: "#44403c",
                color: "#d6d3d1",
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              {prompt.difficulty}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#fafaf9",
              marginBottom: "16px",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {prompt.title}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "16px",
              color: "#a8a29e",
              lineHeight: 1.5,
              overflow: "hidden",
              flex: 1,
            }}
          >
            {prompt.description?.slice(0, 120)}
            {(prompt.description?.length ?? 0) > 120 ? "..." : ""}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <span
              style={{ display: "flex", color: "#a8a29e", fontSize: "14px" }}
            >
              {prompt.recommended_model}
            </span>
            <span
              style={{ display: "flex", color: "#78716c", fontSize: "14px" }}
            >
              AIOpenLibrary
            </span>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 418,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to generate card" },
      { status: 500 }
    );
  }
}
