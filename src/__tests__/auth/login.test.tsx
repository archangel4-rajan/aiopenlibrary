import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}));

// Import the inner form component to avoid Suspense issues
// We test the LoginPage export which wraps in Suspense
import LoginPage from "@/app/auth/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all elements", async () => {
    render(<LoginPage />);
    // Wait for Suspense to resolve
    expect(await screen.findByText("Welcome back")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByText("Sign in")).toBeDefined();
    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByText("Forgot password?")).toBeDefined();
    expect(screen.getByText("Sign up")).toBeDefined();
  });

  it("signs in with email and password on success", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    render(<LoginPage />);
    await screen.findByText("Welcome back");
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign in"));
    await vi.waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });
  });

  it("shows error on invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    render(<LoginPage />);
    await screen.findByText("Welcome back");
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByText("Sign in"));
    expect(
      await screen.findByText("Invalid login credentials")
    ).toBeDefined();
  });

  it("triggers Google OAuth on button click", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    render(<LoginPage />);
    await screen.findByText("Welcome back");
    fireEvent.click(screen.getByText("Continue with Google"));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
      })
    );
  });

  it("renders back to home link", async () => {
    render(<LoginPage />);
    expect(await screen.findByText("← Back to home")).toBeDefined();
  });
});
