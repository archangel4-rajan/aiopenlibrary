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
});
