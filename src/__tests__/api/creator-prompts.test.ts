import { describe, it, expect, vi, beforeEach } from "vitest";

// Track which table is being queried
const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockInsertSingle = vi.fn();
const mockSelectOrder = vi.fn();
const mockPromptSingle = vi.fn();
const mockUpdateSingle = vi.fn();
const mockDeleteEq = vi.fn();

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
        select: (cols?: string) => {
          // For ownership check (select created_by)
          if (cols === "created_by") {
            return {
              eq: () => ({
                single: () => mockPromptSingle(),
              }),
            };
          }
          // For GET (select *)
          return {
            eq: () => ({
              order: () => mockSelectOrder(),
            }),
          };
        },
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => mockUpdateSingle(),
            }),
          }),
        }),
        delete: () => ({
          eq: () => mockDeleteEq(),
        }),
      };
    },
  }),
}));

import { POST, GET } from "@/app/api/creator/prompts/route";

const validBody = {
  slug: "test-creator-prompt",
  title: "Test Creator Prompt",
  description: "This is a test prompt created by a creator account.",
  prompt: "You are a helpful assistant. Help the user with their task in a detailed way.",
  category_id: "cat-123",
  category_name: "Education",
  category_slug: "education",
  tags: ["test", "creator"],
  difficulty: "Intermediate",
};

function makeRequest(body: Record<string, unknown> | string = {}, method = "POST") {
  if (typeof body === "string") {
    return new Request("http://localhost/api/creator/prompts", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });
  }
  return new Request("http://localhost/api/creator/prompts", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setupCreator(userId = "creator-1") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
}

function setupAdmin(userId = "admin-1") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
}

function setupRegularUser(userId = "user-1") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
}

describe("POST /api/creator/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("returns 403 when user has regular role", async () => {
    setupRegularUser();
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("allows creator role to create prompts", async () => {
    setupCreator();
    mockInsertSingle.mockResolvedValue({
      data: { id: "new-1", ...validBody, created_by: "creator-1" },
      error: null,
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.created_by).toBe("creator-1");
  });

  it("allows admin role to create prompts via creator endpoint", async () => {
    setupAdmin();
    mockInsertSingle.mockResolvedValue({
      data: { id: "new-2", ...validBody, created_by: "admin-1" },
      error: null,
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid body (missing slug)", async () => {
    setupCreator();
    const { slug, ...body } = validBody;
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("slug");
  });

  it("returns 400 for invalid JSON", async () => {
    setupCreator();
    const response = await POST(makeRequest("not json{{{"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when slug has invalid characters", async () => {
    setupCreator();
    const response = await POST(makeRequest({ ...validBody, slug: "Bad Slug!" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("lowercase");
  });

  it("returns 400 when prompt text is too short", async () => {
    setupCreator();
    const response = await POST(makeRequest({ ...validBody, prompt: "Short" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when difficulty is invalid", async () => {
    setupCreator();
    const response = await POST(makeRequest({ ...validBody, difficulty: "Expert" }));
    expect(response.status).toBe(400);
  });

  it("returns 500 when database insert fails", async () => {
    setupCreator();
    mockInsertSingle.mockResolvedValue({
      data: null,
      error: { message: "duplicate key" },
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(500);
  });
});

describe("GET /api/creator/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    setupRegularUser();
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns prompts for creator", async () => {
    setupCreator();
    const mockPrompts = [
      { id: "1", title: "Prompt 1", created_by: "creator-1" },
      { id: "2", title: "Prompt 2", created_by: "creator-1" },
    ];
    mockSelectOrder.mockResolvedValue({ data: mockPrompts, error: null });
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(2);
  });

  it("returns prompts for admin", async () => {
    setupAdmin();
    mockSelectOrder.mockResolvedValue({ data: [], error: null });
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
