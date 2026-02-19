import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";

const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe("ShareButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Copy Link button", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test Prompt" />
    );
    expect(container.textContent).toContain("Copy Link");
  });

  it("renders Twitter Share link", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test Prompt" />
    );
    const links = container.querySelectorAll("a");
    const twitterLink = Array.from(links).find((l) =>
      l.getAttribute("href")?.includes("x.com/intent/tweet")
    );
    expect(twitterLink).toBeDefined();
    expect(twitterLink?.textContent).toContain("Share");
  });

  it("renders LinkedIn link", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test Prompt" />
    );
    expect(container.textContent).toContain("LinkedIn");
  });

  it("copies URL to clipboard on click", async () => {
    const { container } = render(
      <ShareButtons url="https://example.com/prompt" title="Test" />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(mockWriteText).toHaveBeenCalledWith(
      "https://example.com/prompt"
    );
  });

  it("shows 'Copied!' after clicking copy", async () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test" />
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    await waitFor(() => {
      expect(container.textContent).toContain("Copied!");
    });
  });

  it("generates correct Twitter share URL", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="My Prompt" />
    );
    const links = container.querySelectorAll("a");
    const twitterLink = Array.from(links).find((l) =>
      l.getAttribute("href")?.includes("x.com/intent/tweet")
    );
    const href = twitterLink?.getAttribute("href") || "";
    expect(href).toContain("x.com/intent/tweet");
    expect(href).toContain(encodeURIComponent("My Prompt"));
    expect(href).toContain(encodeURIComponent("https://example.com"));
  });

  it("generates correct LinkedIn share URL", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test" />
    );
    const links = container.querySelectorAll("a");
    const linkedInLink = Array.from(links).find((l) =>
      l.getAttribute("href")?.includes("linkedin.com")
    );
    const href = linkedInLink?.getAttribute("href") || "";
    expect(href).toContain("linkedin.com/sharing");
    expect(href).toContain(encodeURIComponent("https://example.com"));
  });

  it("opens social links in new tabs", () => {
    const { container } = render(
      <ShareButtons url="https://example.com" title="Test" />
    );
    const links = container.querySelectorAll("a");
    const externalLinks = Array.from(links).filter(
      (l) => l.getAttribute("target") === "_blank"
    );
    expect(externalLinks.length).toBe(2); // Twitter + LinkedIn
  });
});
