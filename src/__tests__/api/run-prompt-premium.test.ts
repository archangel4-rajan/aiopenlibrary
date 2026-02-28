import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockPromptSingle = vi.fn();
const mockPurchaseCheck = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "prompts") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockPromptSingle(),
            }),
          }),
        };
      }
      if (table === "user_purchases") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => mockPurchaseCheck(),
              }),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({
    check: vi.fn().mockReturnValue(true),
  }),
}));

vi.mock("@huggingface/inference", () => {
  return {
    InferenceClient: class {
      chatCompletion = vi.fn().mockResolvedValue({
        choices: [{ message: { content: "Generated text" } }],
      });
    },
  };
});

import { POST } from "@/app/api/prompts/[id]/run/route";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body?: Record<string, unknown>) {
  return new Request("http://localhost/api/prompts/p1/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

describe("POST /api/prompts/[id]/run — premium purchase check", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, HF_API_TOKEN: "test-token" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 403 when running unpurchased premium prompt", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: {
        id: "p1",
        title: "Premium Prompt",
        prompt: "Do something amazing",
        tags: ["type:text"],
        category_slug: "writing",
        recommended_model: null,
        is_premium: true,
        zap_price: 50,
      },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: null });
    const response = await POST(makeRequest(), makeParams("p1"));
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain("premium");
  });

  it("allows running purchased premium prompt", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: {
        id: "p1",
        title: "Premium Prompt",
        prompt: "Do something amazing with detail",
        tags: ["type:text"],
        category_slug: "writing",
        recommended_model: null,
        is_premium: true,
        zap_price: 50,
      },
      error: null,
    });
    mockPurchaseCheck.mockResolvedValue({ data: { id: "purchase-1" } });
    const response = await POST(makeRequest(), makeParams("p1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("text");
  });

  it("allows running free (non-premium) prompt without purchase", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockPromptSingle.mockResolvedValue({
      data: {
        id: "p1",
        title: "Free Prompt",
        prompt: "Do something simple",
        tags: ["type:text"],
        category_slug: "writing",
        recommended_model: null,
        is_premium: false,
        zap_price: null,
      },
      error: null,
    });
    const response = await POST(makeRequest(), makeParams("p1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("text");
  });
});
