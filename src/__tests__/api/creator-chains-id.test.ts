import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockChainOwnerSingle = vi.fn();
const mockChainUpdateSingle = vi.fn();
const mockStepsDelete = vi.fn();
const mockStepsInsert = vi.fn();
const mockChainDelete = vi.fn();
const mockOwnedPromptsSelect = vi.fn();

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
      if (table === "prompt_chains") {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockChainOwnerSingle(),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => mockChainUpdateSingle(),
              }),
            }),
          }),
          delete: () => ({
            eq: () => mockChainDelete(),
          }),
        };
      }
      if (table === "prompt_chain_steps") {
        return {
          delete: () => ({
            eq: () => mockStepsDelete(),
          }),
          insert: () => mockStepsInsert(),
        };
      }
      if (table === "prompts") {
        return {
          select: () => ({
            eq: () => ({
              in: () => mockOwnedPromptsSelect(),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

import { PUT, DELETE } from "@/app/api/creator/chains/[id]/route";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const validBody = {
  title: "Updated Chain Title",
  description: "This is a valid description for the chain.",
  slug: "updated-chain",
  steps: [{ prompt_id: "p1" }],
};

function makePutRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/creator/chains/chain-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/creator/chains/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await PUT(makePutRequest(validBody), makeParams("chain-1"));
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await PUT(makePutRequest(validBody), makeParams("chain-1"));
    expect(response.status).toBe(403);
  });

  it("returns 403 when creator doesn't own chain", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "other-creator" } });
    const response = await PUT(makePutRequest(validBody), makeParams("chain-1"));
    expect(response.status).toBe(403);
  });

  it("returns 400 when title too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "creator-1" } });
    const response = await PUT(makePutRequest({ ...validBody, title: "ab" }), makeParams("chain-1"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when steps empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "creator-1" } });
    const response = await PUT(makePutRequest({ ...validBody, steps: [] }), makeParams("chain-1"));
    expect(response.status).toBe(400);
  });

  it("updates chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "creator-1" } });
    mockOwnedPromptsSelect.mockResolvedValue({ data: [{ id: "p1" }], error: null });
    mockChainUpdateSingle.mockResolvedValue({
      data: { id: "chain-1", title: "Updated Chain Title", slug: "updated-chain" },
      error: null,
    });
    mockStepsDelete.mockResolvedValue({ error: null });
    mockStepsInsert.mockResolvedValue({ error: null });
    const response = await PUT(makePutRequest(validBody), makeParams("chain-1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe("Updated Chain Title");
  });

  it("admin can edit any chain", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "admin" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "other-creator" } });
    mockChainUpdateSingle.mockResolvedValue({
      data: { id: "chain-1", title: "Updated Chain Title" },
      error: null,
    });
    mockStepsDelete.mockResolvedValue({ error: null });
    mockStepsInsert.mockResolvedValue({ error: null });
    const response = await PUT(makePutRequest(validBody), makeParams("chain-1"));
    expect(response.status).toBe(200);
  });
});

describe("DELETE /api/creator/chains/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request("http://localhost/api/creator/chains/chain-1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("chain-1"));
    expect(response.status).toBe(403);
  });

  it("returns 403 when not owner", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "other-creator" } });
    const request = new Request("http://localhost/api/creator/chains/chain-1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("chain-1"));
    expect(response.status).toBe(403);
  });

  it("deletes chain successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainOwnerSingle.mockResolvedValue({ data: { created_by: "creator-1" } });
    mockChainDelete.mockResolvedValue({ error: null });
    const request = new Request("http://localhost/api/creator/chains/chain-1", {
      method: "DELETE",
    });
    const response = await DELETE(request, makeParams("chain-1"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deleted).toBe(true);
  });
});
