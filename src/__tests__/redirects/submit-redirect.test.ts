import { describe, it, expect, vi } from "vitest";

// Mock next/navigation redirect
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("/submit page redirect", () => {
  it("redirects to /creator/prompts/new", async () => {
    const { default: SubmitPage } = await import("@/app/submit/page");
    try {
      SubmitPage();
    } catch {
      // redirect throws NEXT_REDIRECT
    }
    expect(mockRedirect).toHaveBeenCalledWith("/creator/prompts/new");
  });
});

describe("/submit/[id] page redirect", () => {
  it("redirects to /creator/prompts/new", async () => {
    mockRedirect.mockClear();
    const { default: EditDraftPage } = await import("@/app/submit/[id]/page");
    try {
      EditDraftPage();
    } catch {
      // redirect throws NEXT_REDIRECT
    }
    expect(mockRedirect).toHaveBeenCalledWith("/creator/prompts/new");
  });
});
