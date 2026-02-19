import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import VoteButton from "@/components/VoteButton";

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

describe("VoteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = { id: "user-1" };
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("renders like and dislike counts", () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={10}
        dislikesCount={2}
      />
    );
    expect(container.textContent).toContain("10");
    expect(container.textContent).toContain("2");
  });

  it("shows helpful percentage when total >= 3", () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={9}
        dislikesCount={1}
      />
    );
    expect(container.textContent).toContain("90% found helpful");
  });

  it("hides helpful percentage when total < 3", () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={1}
        dislikesCount={0}
      />
    );
    expect(container.textContent).not.toContain("found helpful");
  });

  it("redirects to login when not authenticated", () => {
    mockUser.value = null;
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={0}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]); // like button
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("sends POST with vote_type on new vote", async () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={0}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]); // like
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "like" }),
    });
  });

  it("sends DELETE when toggling off existing vote", async () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote="like"
        likesCount={5}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]); // toggle off like
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/vote", {
      method: "DELETE",
    });
  });

  it("optimistically increments like count", async () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={5}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]); // like
    await waitFor(() => {
      expect(container.textContent).toContain("6");
    });
  });

  it("reverts on fetch error", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote={null}
        likesCount={5}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]); // like
    await waitFor(() => {
      expect(container.textContent).toContain("5");
    });
  });

  it("switches vote from like to dislike", async () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote="like"
        likesCount={5}
        dislikesCount={2}
      />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]); // click dislike while liked
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "dislike" }),
    });
  });

  it("highlights active like button", () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote="like"
        likesCount={5}
        dislikesCount={0}
      />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].className).toContain("emerald");
  });

  it("highlights active dislike button", () => {
    const { container } = render(
      <VoteButton
        promptId="p1"
        initialVote="dislike"
        likesCount={0}
        dislikesCount={3}
      />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[1].className).toContain("red");
  });
});
