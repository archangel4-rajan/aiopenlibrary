import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockOwnershipSingle = vi.fn();
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
        select: () => ({
          eq: () => ({
            single: () => mockOwnershipSingle(),
          }),
        }),
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

import { PUT, DELETE } from "@/app/api/creator/prompts/[id]/route";

const validUpdateBody = {
  slug: "updated-prompt",
  title: "Updated Prompt",
  description: "Updated description that is long enough.",
  prompt: "Updated prompt text that is definitely long enough to pass validation.",
  category_id: "cat-123",
  category_name: "Education",
  category_slug: "education",
  tags: ["updated"],
  difficulty: "Advanced",
};

function makeRequest(body: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/creator/prompts/prompt-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest() {
  return new Request("http://localhost/api/creator/prompts/prompt-1", {
    method: "DELETE",
  });
}

const paramsPromise = Promise.resolve({ id: "prompt-1" });

function setupCreatorOwner(userId = "creator-1") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
  mockOwnershipSingle.mockResolvedValue({ data: { created_by: userId } });
}

function setupCreatorNonOwner(userId = "creator-2") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
  mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
  mockOwnershipSingle.mockResolvedValue({ data: { created_by: "creator-1" } });
}

// ============================================
// PUT /api/creator/prompts/[id]
// ============================================

describe("PUT /api/creator/prompts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("returns 403 when creator does not own the prompt", async () => {
    setupCreatorNonOwner();
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("allows creator to update their own prompt", async () => {
    setupCreatorOwner();
    mockUpdateSingle.mockResolvedValue({
      data: { id: "prompt-1", ...validUpdateBody },
      error: null,
    });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe("Updated Prompt");
  });

  it("allows admin to update via creator endpoint (if they own it)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
    mockOwnershipSingle.mockResolvedValue({ data: { created_by: "admin-1" } });
    mockUpdateSingle.mockResolvedValue({
      data: { id: "prompt-1", ...validUpdateBody },
      error: null,
    });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(200);
  });

  it("returns 403 when prompt does not exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnershipSingle.mockResolvedValue({ data: null });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("returns 500 when database update fails", async () => {
    setupCreatorOwner();
    mockUpdateSingle.mockResolvedValue({
      data: null,
      error: { message: "update failed" },
    });
    const response = await PUT(makeRequest(validUpdateBody), { params: paramsPromise });
    expect(response.status).toBe(500);
  });
});

// ============================================
// DELETE /api/creator/prompts/[id]
// ============================================

describe("DELETE /api/creator/prompts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await DELETE(makeDeleteRequest(), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await DELETE(makeDeleteRequest(), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("returns 403 when creator does not own the prompt", async () => {
    setupCreatorNonOwner();
    const response = await DELETE(makeDeleteRequest(), { params: paramsPromise });
    expect(response.status).toBe(403);
  });

  it("allows creator to delete their own prompt", async () => {
    setupCreatorOwner();
    mockDeleteEq.mockResolvedValue({ error: null });
    const response = await DELETE(makeDeleteRequest(), { params: paramsPromise });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });

  it("returns 500 when database delete fails", async () => {
    setupCreatorOwner();
    mockDeleteEq.mockResolvedValue({ error: { message: "delete failed" } });
    const response = await DELETE(makeDeleteRequest(), { params: paramsPromise });
    expect(response.status).toBe(500);
  });
});
