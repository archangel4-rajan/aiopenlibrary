import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockOwnedPromptsSelect = vi.fn();
const mockPackInsertSingle = vi.fn();
const mockPackItemsInsert = vi.fn();
const mockPackDelete = vi.fn();

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
              in: () => mockOwnedPromptsSelect(),
            }),
          }),
        };
      }
      if (table === "prompt_packs") {
        return {
          insert: () => ({
            select: () => ({
              single: () => mockPackInsertSingle(),
            }),
          }),
          delete: () => ({
            eq: () => mockPackDelete(),
          }),
        };
      }
      if (table === "prompt_pack_items") {
        return {
          insert: () => mockPackItemsInsert(),
        };
      }
      return {};
    },
  }),
}));

vi.mock("@/lib/db", () => ({
  getPublishedPacks: vi.fn().mockResolvedValue([]),
}));

import { POST } from "@/app/api/packs/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/packs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "My Prompt Pack",
  description: "A collection of amazing prompts for productivity.",
  slug: "my-prompt-pack",
  zap_price: 100,
  prompt_ids: ["p1", "p2"],
  is_published: true,
};

describe("POST /api/packs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("returns 400 when name is too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, name: "X" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when description is too short", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, description: "Short" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when zap_price is 0", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, zap_price: 0 }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when prompt_ids is empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    const response = await POST(makeRequest({ ...validBody, prompt_ids: [] }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when not all prompts are owned by creator", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPromptsSelect.mockResolvedValue({ data: [{ id: "p1" }], error: null }); // only 1 of 2
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(400);
  });

  it("creates pack successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPromptsSelect.mockResolvedValue({ data: [{ id: "p1" }, { id: "p2" }], error: null });
    mockPackInsertSingle.mockResolvedValue({
      data: { id: "pack-1", name: "My Prompt Pack", slug: "my-prompt-pack", zap_price: 100 },
      error: null,
    });
    mockPackItemsInsert.mockResolvedValue({ error: null });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe("My Prompt Pack");
  });

  it("returns 409 when slug is taken", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockOwnedPromptsSelect.mockResolvedValue({ data: [{ id: "p1" }, { id: "p2" }], error: null });
    mockPackInsertSingle.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate" } });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(409);
  });
});
