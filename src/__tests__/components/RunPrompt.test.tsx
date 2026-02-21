import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RunPrompt from "@/components/RunPrompt";

// Mock AuthProvider
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockUser: { id: string } | null = null;
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe("RunPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    global.fetch = vi.fn();
  });

  it("renders Run This Prompt button for text type", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="text"
      />
    );
    expect(screen.getByText("Run This Prompt")).toBeDefined();
  });

  it("renders Generate Image button for image type", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="image"
      />
    );
    expect(screen.getByText("Generate Image")).toBeDefined();
  });

  it("renders Generate Video Script button for video type", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="video"
      />
    );
    expect(screen.getByText("Generate Video Script")).toBeDefined();
  });

  it("renders grayed-out box for unspecified type", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="unspecified"
      />
    );
    expect(screen.getByText("Prompt type not specified — run feature unavailable")).toBeDefined();
  });

  it("shows Sign in to Run when user is not logged in", () => {
    mockUser = null;
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="text"
      />
    );
    expect(screen.getByText("Sign in to Run")).toBeDefined();
  });

  it("redirects to login when unauthenticated user clicks run", () => {
    mockUser = null;
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="text"
      />
    );
    fireEvent.click(screen.getByText("Sign in to Run"));
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("calls API when authenticated user clicks run", async () => {
    mockUser = { id: "user-1" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          type: "text",
          model: "Qwen/Qwen2.5-72B-Instruct",
          text: "Generated text output",
        }),
    });

    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="text"
      />
    );
    fireEvent.click(screen.getByText("Run This Prompt"));

    // Verify fetch was called with correct params
    expect(global.fetch).toHaveBeenCalledWith("/api/prompts/p1/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customizedPrompt: "Test prompt" }),
    });
  });

  it("shows Powered by Hugging Face badge for active types", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="text"
      />
    );
    expect(screen.getByText("Powered by Hugging Face Inference API")).toBeDefined();
  });

  it("does not show HF badge for unspecified type", () => {
    mockUser = { id: "user-1" };
    render(
      <RunPrompt
        promptId="p1"
        customizedPrompt="Test prompt"
        promptType="unspecified"
      />
    );
    expect(screen.queryByText("Powered by Hugging Face Inference API")).toBeNull();
  });
});
