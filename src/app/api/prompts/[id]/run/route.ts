import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { InferenceClient } from "@huggingface/inference";

const runLimiter = createRateLimiter("prompt-run", 60_000, 10);

const HF_API_TOKEN = process.env.HF_API_TOKEN;

// Models
const TEXT_MODEL = "Qwen/Qwen2.5-72B-Instruct";
const IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";

const MAX_PROMPT_LENGTH = 4000;
const MAX_TOKENS = 1024;

function isImagePrompt(tags: string[], categorySlug: string): boolean {
  const imageIndicators = [
    "image", "art", "visual", "design", "illustration", "photo",
    "picture", "drawing", "painting", "graphic", "midjourney",
    "dall-e", "stable-diffusion", "image-generation",
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
  let cleaned = prompt.replace(/\{\{[a-z_/|]+\}\}/g, "[specify here]");
  if (cleaned.length > MAX_PROMPT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_PROMPT_LENGTH);
  }
  return cleaned.trim();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to run prompts" }, { status: 401 });
  }

  const allowed = runLimiter.check(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before running another prompt." },
      { status: 429 }
    );
  }

  if (!HF_API_TOKEN) {
    return NextResponse.json(
      { error: "Inference service not configured" },
      { status: 503 }
    );
  }

  let body: { customizedPrompt?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { id } = await params;
  const { data: prompt, error: dbError } = await supabase
    .from("prompts")
    .select("id, title, prompt, tags, category_slug, recommended_model")
    .eq("id", id)
    .single();

  if (dbError || !prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  const rawPrompt = body.customizedPrompt || prompt.prompt;
  const cleanedPrompt = sanitizePromptForInference(rawPrompt);
  const isImage = isImagePrompt(prompt.tags || [], prompt.category_slug || "");

  const client = new InferenceClient(HF_API_TOKEN);

  try {
    if (isImage) {
      const imageResult = await client.textToImage({
        model: IMAGE_MODEL,
        inputs: cleanedPrompt,
        parameters: {
          num_inference_steps: 4,
        },
      });

      // Result can be a Blob or a string depending on the provider
      let base64: string;
      if (typeof imageResult === "string") {
        base64 = imageResult;
      } else {
        const arrayBuffer = await (imageResult as Blob).arrayBuffer();
        base64 = Buffer.from(arrayBuffer).toString("base64");
      }

      return NextResponse.json({
        type: "image",
        model: IMAGE_MODEL,
        image: `data:image/png;base64,${base64}`,
      });
    } else {
      const response = await client.chatCompletion({
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
      });

      const generatedText =
        response.choices?.[0]?.message?.content || "No output generated.";

      return NextResponse.json({
        type: "text",
        model: TEXT_MODEL,
        text: generatedText,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Inference error:", message);

    if (message.includes("loading") || message.includes("503")) {
      return NextResponse.json(
        { error: "Model is loading. Please try again in 30 seconds.", loading: true },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
