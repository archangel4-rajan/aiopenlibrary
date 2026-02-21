import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
let fromCallCount = 0;
const mockProfileSingle = vi.fn();
const mockInsertSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockProfileSingle(),
            }),
          }),
        };
      }
      // prompts table
      return {
        insert: () => ({
          select: () => ({
            single: () => mockInsertSingle(),
          }),
        }),
      };
    },
  }),
}));

import { POST } from "@/app/api/admin/prompts/route";

function makeRequest(body: Record<string, unknown> | string = {}) {
  if (typeof body === "string") {
    return new Request("http://localhost/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    });
  }
  return new Request("http://localhost/api/admin/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  slug: "test-prompt-slug",
  title: "Test Prompt Title",
  description: "This is a test prompt description that is long enough.",
  prompt: "You are a helpful assistant. Help the user with their task in a detailed way.",
  category_id: "cat-123",
  category_name: "Education",
  category_slug: "education",
  tags: ["test", "education"],
  difficulty: "Intermediate",
};

function setupAdmin() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
}

describe("POST /api/admin/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromCallCount = 0;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("returns 400 when slug is missing", async () => {
    setupAdmin();
    const { slug, ...body } = validBody;
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("slug");
  });

  it("returns 400 when slug has invalid characters", async () => {
    setupAdmin();
    const response = await POST(
      makeRequest({ ...validBody, slug: "Invalid Slug!" })
    );
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("lowercase");
  });

  it("returns 400 when title is too short", async () => {
    setupAdmin();
    const response = await POST(makeRequest({ ...validBody, title: "X" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when description is too short", async () => {
    setupAdmin();
    const response = await POST(makeRequest({ ...validBody, description: "Short" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when prompt text is too short", async () => {
    setupAdmin();
    const response = await POST(makeRequest({ ...validBody, prompt: "Too short" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when category_id is missing", async () => {
    setupAdmin();
    const { category_id, ...body } = validBody;
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
  });

  it("returns 400 when difficulty is invalid", async () => {
    setupAdmin();
    const response = await POST(
      makeRequest({ ...validBody, difficulty: "SuperHard" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when tags is not an array", async () => {
    setupAdmin();
    const response = await POST(
      makeRequest({ ...validBody, tags: "not-array" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    setupAdmin();
    const response = await POST(makeRequest("not json{{{"));
    expect(response.status).toBe(400);
  });

  it("returns 201 on successful creation", async () => {
    setupAdmin();
    mockInsertSingle.mockResolvedValue({
      data: { id: "new-1", ...validBody },
      error: null,
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);
  });
});
