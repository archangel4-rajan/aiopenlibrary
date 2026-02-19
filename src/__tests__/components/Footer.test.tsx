import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

// Mock the Logo component to avoid image loading issues
vi.mock("@/components/Logo", () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="logo" data-size={size}>
      Logo
    </div>
  ),
}));

describe("Footer", () => {
  it("renders the brand name", () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain("AIOpenLibrary");
  });

  it("renders the tagline", () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain("free, open-source prompt library");
  });

  it("contains navigation links", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    expect(hrefs).toContain("/categories");
    expect(hrefs).toContain("/search?q=");
    expect(hrefs).toContain("/submit");
    expect(hrefs).toContain("/about");
  });

  it("contains external links to Twitter and GitHub", () => {
    render(<Footer />);
    const externalLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("target") === "_blank");

    const hrefs = externalLinks.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("https://twitter.com/aiopenlibrary");
    expect(hrefs).toContain("https://github.com/aiopenlibrary");
  });

  it("renders the current year in copyright", () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain(
      `© ${new Date().getFullYear()}`
    );
  });

  it("has Explore and Company section headers", () => {
    const { container } = render(<Footer />);
    // Use container.textContent to avoid React Strict Mode double-render issues
    expect(container.textContent).toContain("Explore");
    expect(container.textContent).toContain("Company");
  });
});
