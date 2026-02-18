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
  prompt: "Review this code...",
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
  is_published: true,
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

  it("renders category name", () => {
    const { container } = render(<PromptCard prompt={mockPrompt} />);
    expect(container.textContent).toContain("Software Engineering");
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
});
