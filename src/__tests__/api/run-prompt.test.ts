import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockPromptSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockPromptSingle(),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({
    check: vi.fn().mockReturnValue(true),
  }),
}));

const mockChatCompletion = vi.fn();
const mockTextToImage = vi.fn();

vi.mock("@huggingface/inference", () => ({
  InferenceClient: function() {
    return {
      chatCompletion: mockChatCompletion,
      textToImage: mockTextToImage,
    };
  },
}));

vi.stubEnv("HF_API_TOKEN", "test-token-123");
// Also set process.env directly for Node.js runtime
process.env.HF_API_TOKEN = "test-token-123";

import { POST } from "@/app/api/prompts/[id]/run/route";

function makeRequest(body = {}) {
  return new Request("http://localhost/api/prompts/p1/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const makeParams = (id = "p1") => Promise.resolve({ id });

const textPrompt = {
  id: "p1",
  title: "Test Prompt",
  prompt: "You are a helpful assistant.",
  tags: ["type:text", "productivity"],
  category_slug: "business-strategy",
  recommended_model: "",
};

describe("POST /api/prompts/[id]/run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(401);
  });

  it("returns 404 when prompt not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(404);
  });

  it("generates text for type:text prompts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: textPrompt, error: null });
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: "Hello! I am here to help." } }],
    });

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("text");
    expect(data.text).toBe("Hello! I am here to help.");
    expect(data.model).toContain("Qwen");
  });

  it("generates image for type:image prompts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { ...textPrompt, tags: ["type:image"], category_slug: "design-ux" },
      error: null,
    });
    const mockBlob = new Blob(["fake-image"], { type: "image/png" });
    mockTextToImage.mockResolvedValue(mockBlob);

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("image");
    expect(data.image).toMatch(/^data:image\/png;base64,/);
    expect(data.model).toContain("FLUX");
  });

  it("generates video script for type:video prompts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { ...textPrompt, tags: ["type:video"], category_slug: "video-creation" },
      error: null,
    });
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: "SCENE 1: Kitchen" } }],
    });

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("video");
    expect(data.text).toContain("SCENE 1");
    // Verify video-specific system prompt
    const args = mockChatCompletion.mock.calls[0][0];
    expect(args.messages[0].content).toContain("video production expert");
  });

  it("uses customized prompt when provided", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: textPrompt, error: null });
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: "Custom output" } }],
    });

    await POST(
      makeRequest({ customizedPrompt: "My custom prompt" }),
      { params: makeParams() }
    );
    const args = mockChatCompletion.mock.calls[0][0];
    expect(args.messages[0].content).toBe("My custom prompt");
  });

  it("sanitizes unfilled variables", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { ...textPrompt, prompt: "Help with {{topic}}" },
      error: null,
    });
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: "Output" } }],
    });

    await POST(makeRequest(), { params: makeParams() });
    const args = mockChatCompletion.mock.calls[0][0];
    expect(args.messages[0].content).toContain("[specify here]");
    expect(args.messages[0].content).not.toContain("{{topic}}");
  });

  it("handles HF API errors gracefully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: textPrompt, error: null });
    mockChatCompletion.mockRejectedValue(new Error("Service unavailable"));

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(502);
  });

  it("returns 503 when model is loading", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({ data: textPrompt, error: null });
    mockChatCompletion.mockRejectedValue(new Error("Model is loading"));

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.loading).toBe(true);
  });

  it("defaults to text when no type tag", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: { ...textPrompt, tags: ["no-type-tag"] },
      error: null,
    });
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: "Output" } }],
    });

    const response = await POST(makeRequest(), { params: makeParams() });
    expect(response.status).toBe(200);
    expect(mockChatCompletion).toHaveBeenCalledOnce();
  });
});
