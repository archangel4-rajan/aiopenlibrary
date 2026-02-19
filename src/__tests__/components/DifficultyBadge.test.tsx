import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import DifficultyBadge from "@/components/DifficultyBadge";

describe("DifficultyBadge", () => {
  it("renders Beginner with emerald styling", () => {
    const { container } = render(<DifficultyBadge difficulty="Beginner" />);
    const badge = container.querySelector("span");
    expect(badge?.textContent).toBe("Beginner");
    expect(badge?.className).toContain("emerald");
  });

  it("renders Intermediate with amber styling", () => {
    const { container } = render(<DifficultyBadge difficulty="Intermediate" />);
    const badge = container.querySelector("span");
    expect(badge?.textContent).toBe("Intermediate");
    expect(badge?.className).toContain("amber");
  });

  it("renders Advanced with red styling", () => {
    const { container } = render(<DifficultyBadge difficulty="Advanced" />);
    const badge = container.querySelector("span");
    expect(badge?.textContent).toBe("Advanced");
    expect(badge?.className).toContain("red");
  });

  it("renders sm size by default with smaller padding", () => {
    const { container } = render(<DifficultyBadge difficulty="Beginner" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("py-0.5");
    expect(badge?.className).not.toContain("px-2.5");
  });

  it("renders md size with larger padding when specified", () => {
    const { container } = render(<DifficultyBadge difficulty="Beginner" size="md" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("px-2.5");
  });
});
