import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";

const runLimiter = createRateLimiter("prompt-run", 60_000, 10);

const HF_API_TOKEN = process.env.HF_API_TOKEN;

// Default models per task type
const TEXT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

// Max prompt length to send to inference
const MAX_PROMPT_LENGTH = 4000;
// Max tokens for text generation
const MAX_TOKENS = 1024;

function isImagePrompt(tags: string[], categorySlug: string): boolean {
  const imageIndicators = [
    "image",
    "art",
    "visual",
    "design",
    "illustration",
    "photo",
    "picture",
    "drawing",
    "painting",
    "graphic",
    "midjourney",
    "dall-e",
    "stable-diffusion",
    "image-generation",
  ];
  const imageCategories = ["design-ux", "video-creation"];

  if (imageCategories.includes(categorySlug)) return true;

  return tags.some((tag) =>
    imageIndicators.some(
      (indicator) =>
        tag.toLowerCase().includes(indicator) ||
        indicator.includes(tag.toLowerCase())
    )
  );
}

function sanitizePromptForInference(prompt: string): string {
  // Remove variable placeholders that weren't filled
  let cleaned = prompt.replace(/\{\{[a-z_/|]+\}\}/g, "[specify here]");
  // Trim to max length
  if (cleaned.length > MAX_PROMPT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_PROMPT_LENGTH);
  }
  return cleaned.trim();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to run prompts" }, { status: 401 });
  }

  // Rate limit: 10 runs per minute per user
  const allowed = runLimiter.check(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before running another prompt." },
      { status: 429 }
    );
  }

  // Check HF token
  if (!HF_API_TOKEN) {
    return NextResponse.json(
      { error: "Inference service not configured" },
      { status: 503 }
    );
  }

  // Parse request body
  let body: { customizedPrompt?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Fetch the prompt from DB
  const { id } = await params;
  const { data: prompt, error: dbError } = await supabase
    .from("prompts")
    .select("id, title, prompt, tags, category_slug, recommended_model")
    .eq("id", id)
    .single();

  if (dbError || !prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  // Use customized prompt if provided, otherwise use the template
  const rawPrompt = body.customizedPrompt || prompt.prompt;
  const cleanedPrompt = sanitizePromptForInference(rawPrompt);

  // Determine if this is an image or text prompt
  const isImage = isImagePrompt(prompt.tags || [], prompt.category_slug || "");

  try {
    if (isImage) {
      // Text-to-Image inference
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${IMAGE_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: cleanedPrompt,
            parameters: {
              num_inference_steps: 30,
              guidance_scale: 7.5,
              width: 1024,
              height: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HF Image API error:", response.status, errorText);

        if (response.status === 503) {
          return NextResponse.json(
            { error: "Model is loading. Please try again in 30 seconds.", loading: true },
            { status: 503 }
          );
        }

        return NextResponse.json(
          { error: "Image generation failed. Please try again." },
          { status: 502 }
        );
      }

      // Response is raw image bytes
      const imageBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString("base64");

      return NextResponse.json({
        type: "image",
        model: IMAGE_MODEL,
        image: `data:image/png;base64,${base64}`,
      });
    } else {
      // Text/Chat inference
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${TEXT_MODEL}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: TEXT_MODEL,
            messages: [
              {
                role: "system",
                content: cleanedPrompt,
              },
              {
                role: "user",
                content:
                  "Please demonstrate this prompt by generating a high-quality example output. Show what a real response would look like when this prompt is used effectively.",
              },
            ],
            max_tokens: MAX_TOKENS,
            temperature: 0.7,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HF Text API error:", response.status, errorText);

        if (response.status === 503) {
          return NextResponse.json(
            { error: "Model is loading. Please try again in 30 seconds.", loading: true },
            { status: 503 }
          );
        }

        return NextResponse.json(
          { error: "Text generation failed. Please try again." },
          { status: 502 }
        );
      }

      const data = await response.json();
      const generatedText =
        data.choices?.[0]?.message?.content || "No output generated.";

      return NextResponse.json({
        type: "text",
        model: TEXT_MODEL,
        text: generatedText,
      });
    }
  } catch (err) {
    console.error("Inference error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
