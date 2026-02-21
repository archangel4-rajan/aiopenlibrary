import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "@/components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders the toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    expect(button).toBeDefined();
  });

  it("opens dropdown on click", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button);
    expect(screen.getByText("Light")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
    expect(screen.getByText("System")).toBeDefined();
  });

  it("selects light theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    fireEvent.click(screen.getByText("Light"));
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("selects dark theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    fireEvent.click(screen.getByText("Dark"));
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("selects system theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    fireEvent.click(screen.getByText("System"));
    expect(localStorage.getItem("theme")).toBe("system");
  });

  it("closes dropdown when selecting a theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Light")).toBeDefined();
    fireEvent.click(screen.getByText("Dark"));
    expect(screen.queryByText("Light")).toBeNull();
  });

  it("shows checkmark on the currently selected theme", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    // The dark option should have the checkmark
    const darkButton = screen.getByText("Dark").closest("button");
    expect(darkButton?.textContent).toContain("✓");
  });
});
