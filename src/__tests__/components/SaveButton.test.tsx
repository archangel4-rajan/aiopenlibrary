import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import SaveButton from "@/components/SaveButton";

// Use vi.hoisted for mock variables so they're accessible in vi.mock factories
const { mockUser, mockPush } = vi.hoisted(() => ({
  mockUser: { value: null as { id: string } | null },
  mockPush: vi.fn(),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser.value }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SaveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = { id: "user-1" };
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("renders saves count", () => {
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={false} savesCount={5} />
    );
    expect(container.textContent).toContain("5");
  });

  it("shows filled bookmark when saved", () => {
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={true} savesCount={3} />
    );
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal || svg?.getAttribute("class")).toContain(
      "fill-current"
    );
  });

  it("redirects to login when not authenticated", () => {
    mockUser.value = null;
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={false} savesCount={0} />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("sends POST request when saving", async () => {
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={false} savesCount={0} />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/save", {
      method: "POST",
    });
  });

  it("sends DELETE request when unsaving", async () => {
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={true} savesCount={5} />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/save", {
      method: "DELETE",
    });
  });

  it("optimistically updates count on save", async () => {
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={false} savesCount={3} />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    await waitFor(() => {
      expect(container.textContent).toContain("4");
    });
  });

  it("reverts on API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const { container } = render(
      <SaveButton promptId="p1" initialSaved={false} savesCount={3} />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    await waitFor(() => {
      expect(container.textContent).toContain("3");
    });
  });

  it("renders md size variant with save text", () => {
    const { container } = render(
      <SaveButton
        promptId="p1"
        initialSaved={false}
        savesCount={1}
        size="md"
      />
    );
    expect(container.textContent).toContain("1 save");
  });

  it("renders plural 'saves' for count != 1", () => {
    const { container } = render(
      <SaveButton
        promptId="p1"
        initialSaved={false}
        savesCount={5}
        size="md"
      />
    );
    expect(container.textContent).toContain("5 saves");
  });
});
