import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "@/components/Breadcrumb";

describe("Breadcrumb", () => {
  it("renders a single item without separator", () => {
    const { container } = render(<Breadcrumb items={[{ label: "Home" }]} />);
    expect(container.textContent).toContain("Home");
    expect(container.textContent).not.toContain("/");
  });

  it("renders multiple items with separators", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: "Coding" },
        ]}
      />
    );
    expect(container.textContent).toContain("Home");
    expect(container.textContent).toContain("Categories");
    expect(container.textContent).toContain("Coding");
    // Use textContent to avoid React Strict Mode double-render issues
    const text = container.textContent || "";
    expect(text).toMatch(/Home.*\/.*Categories.*\/.*Coding/);
  });

  it("renders links for items with href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Current Page" },
        ]}
      />
    );
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0].getAttribute("href")).toBe("/");
  });

  it("renders plain text for items without href", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "Final Item" }]} />
    );
    // The final item should be rendered as a span, not a link
    const spans = container.querySelectorAll("span");
    const finalItemSpan = Array.from(spans).find(
      (s) => s.textContent === "Final Item"
    );
    expect(finalItemSpan).toBeDefined();
    expect(finalItemSpan?.tagName).toBe("SPAN");
  });
});
