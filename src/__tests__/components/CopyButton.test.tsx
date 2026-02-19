import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import CopyButton from "@/components/CopyButton";

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default 'Copy Prompt' text", () => {
    const { container } = render(<CopyButton text="hello world" />);
    expect(container.textContent).toContain("Copy Prompt");
  });

  it("copies text to clipboard on click", async () => {
    const { container } = render(<CopyButton text="prompt text here" />);
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(mockWriteText).toHaveBeenCalledWith("prompt text here");
  });

  it("shows 'Copied!' after clicking", async () => {
    const { container } = render(<CopyButton text="test" />);
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    await waitFor(() => {
      expect(container.textContent).toContain("Copied!");
    });
  });

  it("applies custom className", () => {
    const { container } = render(<CopyButton text="test" className="px-4 py-2" />);
    const button = container.querySelector("button")!;
    expect(button.className).toContain("px-4");
    expect(button.className).toContain("py-2");
  });
});
