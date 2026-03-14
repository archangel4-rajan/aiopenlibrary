import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/Sidebar";

// Mock AuthProvider
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@test.com" },
    profile: { role: "creator" },
    isAdmin: false,
    isCreator: true,
    isLoading: false,
  }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }),
}));

// Mock Logo component
vi.mock("@/components/Logo", () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="logo" data-size={size}>
      Logo
    </div>
  ),
}));

// Mock AuthButton
vi.mock("@/components/AuthButton", () => ({
  default: () => <button>Auth</button>,
}));

// Mock ThemeToggle
vi.mock("@/components/ThemeToggle", () => ({
  default: () => <button>Theme</button>,
}));

// Mock ZapBalance
vi.mock("@/components/ZapBalance", () => ({
  default: () => <span>Zaps</span>,
}));

// Mock fetch for categories
global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve([]),
});

describe("Sidebar", () => {
  it("renders the Submit link pointing to /creator/prompts/new", () => {
    render(<Sidebar />);
    const submitLink = screen.getByText("Submit").closest("a");
    expect(submitLink).toHaveAttribute("href", "/creator/prompts/new");
  });

  it("renders the My Prompts link pointing to /creator", () => {
    render(<Sidebar />);
    const creatorLink = screen.getByText("My Prompts").closest("a");
    expect(creatorLink).toHaveAttribute("href", "/creator");
  });

  it("renders the Home link", () => {
    render(<Sidebar />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders the Leaderboard link", () => {
    render(<Sidebar />);
    const link = screen.getByText("Leaderboard").closest("a");
    expect(link).toHaveAttribute("href", "/leaderboard");
  });

  it("renders Your Library when user is logged in", () => {
    render(<Sidebar />);
    const link = screen.getByText("Your Library").closest("a");
    expect(link).toHaveAttribute("href", "/profile");
  });

  it("does not link to /submit anywhere", () => {
    render(<Sidebar />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).not.toContain("/submit");
  });
});
