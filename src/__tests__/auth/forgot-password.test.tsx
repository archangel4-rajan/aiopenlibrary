import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockResetPasswordForEmail = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: (...args: unknown[]) =>
        mockResetPasswordForEmail(...args),
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import ForgotPasswordPage from "@/app/auth/forgot-password/page";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Reset your password")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByText("Send reset link")).toBeDefined();
  });

  it("sends reset email on submit", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByText("Send reset link"));
    expect(await screen.findByText("Check your email")).toBeDefined();
  });

  it("shows error on failure", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByText("Send reset link"));
    expect(await screen.findByText("Rate limit exceeded")).toBeDefined();
  });

  it("has link back to sign in", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("← Back to sign in")).toBeDefined();
  });
});
