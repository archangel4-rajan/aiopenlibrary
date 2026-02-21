import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { InferenceClient } from "@huggingface/inference";

const runLimiter = createRateLimiter("prompt-run", 60_000, 10);

function getHfApiToken() {
  return process.env.HF_API_TOKEN;
}

// Models per prompt type
const MODELS = {
  text: "Qwen/Qwen2.5-72B-Instruct",
  image: "black-forest-labs/FLUX.1-schnell",
  video: "Qwen/Qwen2.5-72B-Instruct", // Video prompts generate scripts (text), not actual video
};

const MAX_PROMPT_LENGTH = 4000;
const MAX_TOKENS = 1024;

type PromptType = "text" | "image" | "video" | "unspecified";

function getPromptType(tags: string[]): PromptType {
  const typeTag = (tags || []).find((t) => t.startsWith("type:"));
  if (!typeTag) return "unspecified";
  const type = typeTag.replace("type:", "") as PromptType;
  if (["text", "image", "video", "unspecified"].includes(type)) return type;
  return "unspecified";
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
    return NextResponse.json(
      { error: "Sign in to run prompts" },
      { status: 401 }
    );
  }

  const allowed = runLimiter.check(user.id);
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please wait a moment before running another prompt.",
      },
      { status: 429 }
    );
  }

  const HF_API_TOKEN = getHfApiToken();
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
  const promptType = getPromptType(prompt.tags || []);

  const client = new InferenceClient(HF_API_TOKEN);

  try {
    if (promptType === "image") {
      // Image generation
      const imageResult = await client.textToImage({
        model: MODELS.image,
        inputs: cleanedPrompt,
        parameters: {
          num_inference_steps: 4,
        },
      });

      let base64: string;
      if (typeof imageResult === "string") {
        base64 = imageResult;
      } else {
        const arrayBuffer = await (imageResult as Blob).arrayBuffer();
        base64 = Buffer.from(arrayBuffer).toString("base64");
      }

      return NextResponse.json({
        type: "image",
        model: MODELS.image,
        image: `data:image/png;base64,${base64}`,
      });
    } else {
      // Text generation (for text, video, and unspecified prompt types)
      // Video prompts generate scripts/plans as text output
      const model =
        promptType === "video" ? MODELS.video : MODELS.text;

      const systemMessage =
        promptType === "video"
          ? `You are a video production expert. ${cleanedPrompt}`
          : cleanedPrompt;

      const userMessage =
        promptType === "video"
          ? "Please demonstrate this prompt by generating a detailed, production-ready example output. Include scene descriptions, dialogue, and technical directions where appropriate."
          : "Please demonstrate this prompt by generating a high-quality example output. Show what a real response would look like when this prompt is used effectively.";

      const response = await client.chatCompletion({
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      });

      const generatedText =
        response.choices?.[0]?.message?.content || "No output generated.";

      return NextResponse.json({
        type: promptType === "video" ? "video" : "text",
        model,
        text: generatedText,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Inference error:", message);

    if (message.includes("loading") || message.includes("503")) {
      return NextResponse.json(
        {
          error: "Model is loading. Please try again in 30 seconds.",
          loading: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
