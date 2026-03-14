import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModelBadge from "@/components/ModelBadge";

describe("ModelBadge", () => {
  it("renders model name", () => {
    render(<ModelBadge model="Claude Opus 4" icon="anthropic" />);
    expect(screen.getByText("Claude Opus 4")).toBeInTheDocument();
  });

  it("renders anthropic icon for anthropic models", () => {
    const { container } = render(
      <ModelBadge model="Claude Sonnet 4" icon="anthropic" />
    );
    expect(container.textContent).toContain("✦");
  });

  it("renders openai icon for openai models", () => {
    const { container } = render(
      <ModelBadge model="GPT-4o" icon="openai" />
    );
    expect(container.textContent).toContain("◆");
  });

  it("renders google icon for google models", () => {
    const { container } = render(
      <ModelBadge model="Gemini 2.5 Pro" icon="google" />
    );
    expect(container.textContent).toContain("●");
  });

  it("renders default icon for unknown models", () => {
    const { container } = render(
      <ModelBadge model="Some Model" icon="other" />
    );
    expect(container.textContent).toContain("◇");
  });

  // --- Icon inference tests (when icon is empty) ---

  it("infers anthropic icon from Claude model name when icon is empty", () => {
    const { container } = render(
      <ModelBadge model="Claude Opus 4" icon="" />
    );
    expect(container.textContent).toContain("✦");
  });

  it("infers openai icon from GPT model name when icon is empty", () => {
    const { container } = render(
      <ModelBadge model="GPT-4o" icon="" />
    );
    expect(container.textContent).toContain("◆");
  });

  it("infers google icon from Gemini model name when icon is empty", () => {
    const { container } = render(
      <ModelBadge model="Gemini 2.5 Pro" icon="" />
    );
    expect(container.textContent).toContain("●");
  });

  it("infers xai icon from Grok model name when icon is empty", () => {
    const { container } = render(
      <ModelBadge model="Grok 4.20" icon="" />
    );
    expect(container.textContent).toContain("✕");
  });

  it("infers meta icon from Llama model name when icon is empty", () => {
    const { container } = render(
      <ModelBadge model="Llama 3.3" icon="" />
    );
    expect(container.textContent).toContain("◈");
  });

  it("falls back to diamond for truly unknown model with no icon", () => {
    const { container } = render(
      <ModelBadge model="Any Model" icon="" />
    );
    expect(container.textContent).toContain("◇");
  });
});
