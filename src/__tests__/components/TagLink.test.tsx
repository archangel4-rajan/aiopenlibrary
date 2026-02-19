import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TagLink from "@/components/TagLink";

describe("TagLink", () => {
  it("renders the tag text", () => {
    const { container } = render(<TagLink tag="javascript" />);
    expect(container.textContent).toContain("javascript");
  });

  it("links to search with the tag as query", () => {
    const { container } = render(<TagLink tag="react hooks" />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/search?q=react%20hooks");
  });

  it("does not show icon by default", () => {
    const { container } = render(<TagLink tag="test" />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("shows icon when showIcon is true", () => {
    const { container } = render(<TagLink tag="test" showIcon />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it("applies sm size classes by default", () => {
    const { container } = render(<TagLink tag="test" />);
    const link = container.querySelector("a");
    expect(link?.className).toContain("text-[11px]");
  });

  it("applies md size classes when specified", () => {
    const { container } = render(<TagLink tag="test" size="md" />);
    const link = container.querySelector("a");
    expect(link?.className).toContain("text-xs");
  });
});
