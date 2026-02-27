import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockOwnedPrompts = vi.fn();
const mockChainInsertSingle = vi.fn();
const mockStepsInsert = vi.fn();
const mockChainDelete = vi.fn();

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
      if (table === "prompts") {
        return {
          select: () => ({
            eq: () => ({
              in: () => mockOwnedPrompts(),
            }),
          }),
        };
      }
      if (table === "prompt_chains") {
        return {
          insert: () => ({
            select: () => ({
              single: () => mockChainInsertSingle(),
            }),
          }),
          delete: () => ({
            eq: () => mockChainDelete(),
          }),
          select: () => ({
            eq: () => ({
              order: () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "prompt_chain_steps") {
        return {
          insert: () => mockStepsInsert(),
          select: () => ({
            in: () => ({ data: [], error: null }),
          }),
        };
      }
      return {};
    },
  }),
}));

import { POST } from "@/app/api/creator/chains/route";

const validBody = {
  title: "Build a Business Plan",
  description: "A step-by-step chain to create a comprehensive business plan from scratch.",
  slug: "build-business-plan",
  difficulty: "Intermediate",
  steps: [
    { prompt_id: "p1", step_number: 1, input_instructions: "Start here" },
    { prompt_id: "p2", step_number: 2, input_instructions: "Use output from step 1" },
  ],
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/creator/chains", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/creator/chains", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("returns 400 when title is too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, title: "AB" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("title");
  });

  it("returns 400 when description is too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, description: "Short" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when slug is invalid", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, slug: "Bad Slug!" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when steps is empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, steps: [] }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when difficulty is invalid", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, difficulty: "Expert" }));
    expect(response.status).toBe(400);
  });

  it("returns 403 when prompts not owned by creator", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPrompts.mockResolvedValue({ data: [{ id: "p1" }], error: null }); // only 1 of 2
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("creates chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPrompts.mockResolvedValue({ data: [{ id: "p1" }, { id: "p2" }], error: null });
    mockChainInsertSingle.mockResolvedValue({
      data: { id: "chain-1", title: "Build a Business Plan", slug: "build-business-plan" },
      error: null,
    });
    mockStepsInsert.mockResolvedValue({ error: null });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.title).toBe("Build a Business Plan");
  });

  it("rolls back chain if steps insert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPrompts.mockResolvedValue({ data: [{ id: "p1" }, { id: "p2" }], error: null });
    mockChainInsertSingle.mockResolvedValue({
      data: { id: "chain-1" },
      error: null,
    });
    mockStepsInsert.mockResolvedValue({ error: { message: "insert failed" } });
    mockChainDelete.mockResolvedValue({ error: null });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(500);
  });

  it("returns 400 for invalid JSON", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "c1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const req = new Request("http://localhost/api/creator/chains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json{{{",
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
