import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CategoryCard from "@/components/CategoryCard";

const mockCategory = {
  name: "Software Engineering",
  slug: "software-engineering",
  icon: "💻",
  description: "Prompts for developers",
  promptCount: 42,
};

describe("CategoryCard", () => {
  it("renders category name", () => {
    const { container } = render(<CategoryCard category={mockCategory} />);
    expect(container.textContent).toContain("Software Engineering");
  });

  it("renders prompt count", () => {
    const { container } = render(<CategoryCard category={mockCategory} />);
    expect(container.textContent).toContain("42 prompts");
  });

  it("renders category icon", () => {
    const { container } = render(<CategoryCard category={mockCategory} />);
    expect(container.textContent).toContain("💻");
  });

  it("links to the correct category page", () => {
    const { container } = render(<CategoryCard category={mockCategory} />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/category/software-engineering");
  });

  it("renders with zero prompts", () => {
    const { container } = render(
      <CategoryCard category={{ ...mockCategory, promptCount: 0 }} />
    );
    expect(container.textContent).toContain("0 prompts");
  });
});
