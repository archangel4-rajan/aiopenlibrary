import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SkeletonCard from "@/components/SkeletonCard";

describe("SkeletonCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeDefined();
  });

  it("contains animated pulse elements", () => {
    const { container } = render(<SkeletonCard />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("has skeleton elements for the card structure", () => {
    const { container } = render(<SkeletonCard />);
    // Just verify there are multiple skeleton placeholder divs
    const roundedElements = container.querySelectorAll(".rounded");
    expect(roundedElements.length).toBeGreaterThan(3);
  });
});
