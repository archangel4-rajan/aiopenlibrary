import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PromptCard from "@/components/PromptCard";
import type { DbPrompt } from "@/lib/types";

// Mock AuthProvider
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isAdmin: false,
    isLoading: false,
  }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
  }),
}));

const mockPrompt: DbPrompt = {
  id: "test-id-1",
  slug: "test-prompt",
  title: "Test Code Review Prompt",
  description: "A comprehensive code review prompt for senior developers",
  category_id: "cat-1",
  category_name: "Software Engineering",
  category_slug: "software-engineering",
  prompt: "Review this {{programming_language}} code for {{review_focus}} issues...",
  tags: ["code-review", "testing", "best-practices", "security"],
  recommended_model: "Claude Opus 4",
  model_icon: "anthropic",
  use_cases: ["Pre-merge reviews"],
  example_output: null,
  output_screenshots: null,
  references: [],
  variables: [],
  tips: null,
  difficulty: "Intermediate",
  saves_count: 42,
  likes_count: 15,
  dislikes_count: 3,
  is_published: true,
  is_premium: false,
  premium_preview_length: null,
  zap_price: null,
  created_by: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("PromptCard", () => {
  it("renders prompt title", () => {
    render(<PromptCard prompt={mockPrompt} />);
    expect(screen.getByText("Test Code Review Prompt")).toBeInTheDocument();
  });

  it("renders prompt description", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain(
      "A comprehensive code review prompt for senior developers"
    );
  });

  it("renders category name by default", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("Software Engineering");
  });

  it("hides category name when showCategory is false", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} showCategory={false} />);
    // Category name should not appear as a badge
    const badges = container.querySelectorAll(".rounded-md.bg-stone-100");
    const categoryBadge = Array.from(badges).find((b) =>
      b.textContent?.includes("Software Engineering")
    );
    expect(categoryBadge).toBeUndefined();
  });

  it("renders tags", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("code-review");
    expect(container.textContent).toContain("testing");
    expect(container.textContent).toContain("best-practices");
  });

  it("renders overflow tag count for 4+ tags", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("+1");
  });

  it("renders difficulty badge", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("Intermediate");
  });

  it("renders model badge", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("Claude Opus 4");
  });

  it("links to the prompt detail page", () => {
    render(<PromptCard prompt={mockPrompt} />);
    const links = screen.getAllByRole("link");
    const promptLink = links.find(
      (l) => l.getAttribute("href") === "/prompts/test-prompt"
    );
    expect(promptLink).toBeDefined();
  });

  it("renders saves count", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("42");
  });

  // --- New tests for card quality improvements ---

  it("extracts and shows variable chips from prompt text", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("programming language");
    expect(container.textContent).toContain("review focus");
  });

  it("does not show variable chips when prompt has no variables", () => {
    const noVarPrompt = { ...mockPrompt, prompt: "Just a plain prompt with no variables." };
    const { container } = render(<PromptCard prompt={noVarPrompt} />);
    // Should not have the variable chip container
    expect(container.textContent).not.toContain("programming language");
  });

  it("deduplicates variable names", () => {
    const dupPrompt = {
      ...mockPrompt,
      prompt: "Use {{my_topic_var}} to explore {{my_topic_var}} and {{my_audience_var}} for {{my_audience_var}}.",
    };
    const { container } = render(<PromptCard prompt={dupPrompt} />);
    const chips = container.querySelectorAll(".rounded.bg-stone-50");
    // Should have exactly 2 variable chips (deduplicated)
    const chipTexts = Array.from(chips).map((c) => c.textContent?.trim()).filter(Boolean);
    const varChips = chipTexts.filter((t) => t === "my topic var" || t === "my audience var");
    expect(varChips).toHaveLength(2);
  });

  it("limits variable chips to 4", () => {
    const manyVarPrompt = {
      ...mockPrompt,
      prompt: "{{var_alpha}} {{var_bravo}} {{var_charlie}} {{var_delta}} {{var_echo}} {{var_foxtrot}}",
    };
    const { container } = render(<PromptCard prompt={manyVarPrompt} />);
    const text = container.textContent || "";
    // Should show first 4 but not 5th or 6th
    expect(text).toContain("var alpha");
    expect(text).toContain("var delta");
    expect(text).not.toContain("var echo");
    expect(text).not.toContain("var foxtrot");
  });

  it("shows creator attribution when creator prop is provided", () => {
    const { container } = render(
      <PromptCard
        prompt={mockPrompt}
        creator={{ display_name: "Jane Doe", username: "janedoe" }}
      />
    );
    expect(container.textContent).toContain("by Jane Doe");
  });

  it("falls back to username when display_name is null", () => {
    const { container } = render(
      <PromptCard
        prompt={mockPrompt}
        creator={{ display_name: null, username: "janedoe" }}
      />
    );
    expect(container.textContent).toContain("by janedoe");
  });

  it("does not show attribution when creator is null", () => {
    const { container } = render(
      <PromptCard prompt={mockPrompt} creator={null} />
    );
    expect(container.textContent).not.toContain("by ");
  });

  it("does not render ghost hover CTA", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).not.toContain("View prompt");
  });
});
