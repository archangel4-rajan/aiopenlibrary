import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const alt = "AIOpenLibrary Prompt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Use a lightweight Supabase client — the server cookie-based client
  // doesn't work here since OG image generation has no cookie context
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: prompt } = await supabase
    .from("prompts")
    .select("title, description, category_name, difficulty, recommended_model, tags")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!prompt) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1c1917",
            color: "#fafaf9",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          AIOpenLibrary
        </div>
      ),
      { ...size }
    );
  }

  const difficultyColor =
    prompt.difficulty === "Beginner"
      ? "#10b981"
      : prompt.difficulty === "Intermediate"
        ? "#f59e0b"
        : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#1c1917",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#a8a29e",
              fontSize: 20,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: "#fafaf9" }}>
              AIOpenLibrary
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                backgroundColor: "#292524",
                border: "1px solid #44403c",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 16,
                color: "#a8a29e",
              }}
            >
              {prompt.category_name}
            </span>
            <span
              style={{
                backgroundColor: "#292524",
                border: "1px solid #44403c",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 16,
                color: difficultyColor,
              }}
            >
              {prompt.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: prompt.title.length > 40 ? 48 : 56,
              fontWeight: 800,
              color: "#fafaf9",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {prompt.title}
          </h1>
          <p
            style={{
              fontSize: 22,
              color: "#78716c",
              marginTop: 20,
              lineHeight: 1.5,
              maxWidth: "80%",
            }}
          >
            {prompt.description.length > 120
              ? prompt.description.slice(0, 120) + "..."
              : prompt.description}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #44403c",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 16,
              color: "#78716c",
            }}
          >
            <span>{prompt.recommended_model}</span>
            <span>•</span>
            <span>{prompt.tags.slice(0, 3).join(" · ")}</span>
          </div>
          <span style={{ fontSize: 16, color: "#57534e" }}>
            aiopenlibrary.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
