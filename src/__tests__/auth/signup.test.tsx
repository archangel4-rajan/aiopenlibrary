import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import SignupPage from "@/app/auth/signup/page";

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all fields", () => {
    render(<SignupPage />);
    expect(screen.getByText("Create your account")).toBeDefined();
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByText("Create account")).toBeDefined();
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("renders link to sign in page", () => {
    render(<SignupPage />);
    expect(screen.getByText("Sign in")).toBeDefined();
  });

  it("renders link back to home", () => {
    render(<SignupPage />);
    expect(screen.getByText("← Back to home")).toBeDefined();
  });

  it("validates password length before submitting", async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByText("Create account"));
    // Should show error for short password
    expect(
      await screen.findByText("Password must be at least 6 characters")
    ).toBeDefined();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows success message after successful signup", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(screen.getByText("Create account"));
    expect(await screen.findByText("Check your email")).toBeDefined();
  });

  it("shows error message on signup failure", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(screen.getByText("Create account"));
    expect(
      await screen.findByText("User already registered")
    ).toBeDefined();
  });

  it("triggers Google OAuth on button click", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    render(<SignupPage />);
    fireEvent.click(screen.getByText("Continue with Google"));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
      })
    );
  });
});
