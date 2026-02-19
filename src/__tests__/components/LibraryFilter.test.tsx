import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LibraryFilter from "@/components/LibraryFilter";
import type { DbPrompt } from "@/lib/types";

// Mock AuthProvider
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
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

const mockPrompts: DbPrompt[] = [
  {
    id: "1",
    slug: "code-review",
    title: "Code Review Prompt",
    description: "Review code thoroughly",
    category_id: "cat-1",
    category_name: "Software Engineering",
    category_slug: "software-engineering",
    prompt: "...",
    tags: ["code-review"],
    recommended_model: "Claude Opus 4",
    model_icon: "anthropic",
    use_cases: [],
    example_output: null,
    output_screenshots: null,
    references: [],
    variables: [],
    tips: null,
    difficulty: "Intermediate",
    saves_count: 10,
    likes_count: 5,
    dislikes_count: 1,
    is_published: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    slug: "blog-post",
    title: "Blog Post Writer",
    description: "Write engaging blog posts",
    category_id: "cat-2",
    category_name: "Writing & Content",
    category_slug: "writing-content",
    prompt: "...",
    tags: ["writing", "blog"],
    recommended_model: "GPT-4o",
    model_icon: "openai",
    use_cases: [],
    example_output: null,
    output_screenshots: null,
    references: [],
    variables: [],
    tips: null,
    difficulty: "Beginner",
    saves_count: 20,
    likes_count: 8,
    dislikes_count: 2,
    is_published: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("LibraryFilter", () => {
  it("renders all prompts initially", () => {
    render(<LibraryFilter prompts={mockPrompts} savedIds={["1", "2"]} />);
    // Both prompt cards should exist (h3 headings within cards)
    const headings = screen.getAllByRole("heading", { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toContain("Code Review Prompt");
    expect(headingTexts).toContain("Blog Post Writer");
  });

  it("filters prompts by search query", async () => {
    render(<LibraryFilter prompts={mockPrompts} savedIds={["1", "2"]} />);
    const searchInputs = screen.getAllByPlaceholderText("Search your library...");

    await act(async () => {
      fireEvent.change(searchInputs[0], { target: { value: "Blog" } });
    });

    // After filtering, the results count text should indicate 1 prompt
    expect(screen.getByText(/1 prompt/)).toBeInTheDocument();
    expect(screen.getByText(/matching "Blog"/)).toBeInTheDocument();
  });

  it("filters prompts by category", async () => {
    render(<LibraryFilter prompts={mockPrompts} savedIds={["1", "2"]} />);
    const selects = screen.getAllByRole("combobox");

    await act(async () => {
      fireEvent.change(selects[0], { target: { value: "writing-content" } });
    });

    // After filtering, should show 1 prompt in Writing & Content
    expect(screen.getByText(/1 prompt/)).toBeInTheDocument();
    expect(screen.getByText(/in Writing & Content/)).toBeInTheDocument();
  });

  it("shows empty state when no prompts match", async () => {
    render(<LibraryFilter prompts={mockPrompts} savedIds={["1", "2"]} />);
    const searchInputs = screen.getAllByPlaceholderText("Search your library...");

    await act(async () => {
      fireEvent.change(searchInputs[0], { target: { value: "nonexistent123" } });
    });

    expect(screen.getByText("No prompts match your filters.")).toBeInTheDocument();
  });

  it("renders category dropdown with all categories", () => {
    render(<LibraryFilter prompts={mockPrompts} savedIds={["1", "2"]} />);
    expect(screen.getAllByText("All Categories").length).toBeGreaterThan(0);
  });
});
