import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const alt = "AIOpenLibrary Chain";
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#1c1917", color: "#fafaf9", fontSize: 48, fontWeight: 700 }}>
          AIOpenLibrary
        </div>
      ),
      { ...size }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: chain } = await supabase
    .from("prompt_chains")
    .select("id, title, description, category_name, difficulty, estimated_minutes, steps_count")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!chain) {
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

  // Count steps from prompt_chain_steps as a reliable source
  const { count: stepsCount } = await supabase
    .from("prompt_chain_steps")
    .select("*", { count: "exact", head: true })
    .eq("chain_id", chain.id);

  const stepCount = stepsCount ?? chain.steps_count ?? 0;

  const difficultyColor =
    chain.difficulty === "Beginner"
      ? "#10b981"
      : chain.difficulty === "Intermediate"
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
            {/* Chain badge */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                border: "1px solid #f59e0b",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 16,
                color: "#f59e0b",
                fontWeight: 600,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Chain
            </span>
            {chain.category_name && (
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
                {chain.category_name}
              </span>
            )}
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
              {chain.difficulty}
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
              fontSize: chain.title.length > 40 ? 48 : 56,
              fontWeight: 800,
              color: "#fafaf9",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {chain.title}
          </h1>
          {chain.description && (
            <p
              style={{
                fontSize: 22,
                color: "#78716c",
                marginTop: 20,
                lineHeight: 1.5,
                maxWidth: "80%",
              }}
            >
              {chain.description.length > 120
                ? chain.description.slice(0, 120) + "..."
                : chain.description}
            </p>
          )}
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
            <span>
              {stepCount} {stepCount === 1 ? "step" : "steps"}
            </span>
            {chain.estimated_minutes && (
              <>
                <span>•</span>
                <span>~{chain.estimated_minutes} min</span>
              </>
            )}
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
