import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import NewsletterCTA from "@/components/NewsletterCTA";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("NewsletterCTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logged-out state", () => {
    it("renders email input and subscribe button", () => {
      render(<NewsletterCTA user={null} />);
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
    });

    it("renders heading and description", () => {
      const { container } = render(<NewsletterCTA user={null} />);
      expect(container.textContent).toContain("Stay in the loop");
      expect(container.textContent).toContain("best new prompts");
    });

    it("shows error for invalid email", async () => {
      render(<NewsletterCTA user={null} />);
      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "bad" } });
      // Use submit on the form directly to bypass native email validation in jsdom
      const form = input.closest("form")!;
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("shows error for empty email", async () => {
      render(<NewsletterCTA user={null} />);
      const form = screen.getByPlaceholderText("you@example.com").closest("form")!;
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    it("submits valid email and shows success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "You're subscribed! Welcome aboard." }),
      });

      const { container } = render(<NewsletterCTA user={null} />);
      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "test@example.com" } });
      const form = input.closest("form")!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(container.textContent).toContain("You're subscribed!");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
    });

    it("shows API error message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Too many requests. Please try again later." }),
      });

      render(<NewsletterCTA user={null} />);
      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "test@example.com" } });
      const form = input.closest("form")!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText(/Too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe("logged-in state", () => {
    const user = { id: "user-1", email: "me@example.com" };

    it("renders subscribe button without email input", () => {
      render(<NewsletterCTA user={user} />);
      expect(screen.getByRole("button", { name: /subscribe to our newsletter/i })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("you@example.com")).not.toBeInTheDocument();
    });

    it("subscribes using account email on click", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "You're subscribed! Welcome aboard." }),
      });

      const { container } = render(<NewsletterCTA user={user} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));
      });

      await waitFor(() => {
        expect(container.textContent).toContain("You're subscribed!");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "me@example.com" }),
      });
    });

    it("shows already subscribed message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "You're already subscribed!" }),
      });

      const { container } = render(<NewsletterCTA user={user} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));
      });

      await waitFor(() => {
        expect(container.textContent).toContain("You're subscribed!");
      });
    });
  });

  describe("network error", () => {
    it("shows fallback error on fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<NewsletterCTA user={null} />);
      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "test@example.com" } });
      const form = input.closest("form")!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });
  });
});
