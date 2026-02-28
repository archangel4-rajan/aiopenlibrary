import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockChainsSelect = vi.fn();
const mockStepsSelect = vi.fn();

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
              order: () => mockChainsSelect(),
            }),
          }),
        };
      }
      if (table === "prompt_chain_steps") {
        return {
          select: () => ({
            in: () => mockStepsSelect(),
          }),
        };
      }
      return {};
    },
  }),
}));

import { GET } from "@/app/api/creator/chains/route";

describe("GET /api/creator/chains", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "user" } });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns chains for creator", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "creator-1" } } });
    mockProfileSingle.mockResolvedValue({ data: { role: "creator" } });
    mockChainsSelect.mockResolvedValue({
      data: [
        { id: "chain-1", title: "My Chain", created_by: "creator-1" },
      ],
      error: null,
    });
    mockStepsSelect.mockResolvedValue({
      data: [
        { chain_id: "chain-1" },
        { chain_id: "chain-1" },
      ],
    });
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("My Chain");
    expect(data[0].step_count).toBe(2);
  });
});
