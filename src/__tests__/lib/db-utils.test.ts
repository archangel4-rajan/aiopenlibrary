import { describe, it, expect } from "vitest";
import { sanitizeSearchQuery } from "@/lib/db-utils";

describe("sanitizeSearchQuery", () => {
  it("returns plain strings unchanged", () => {
    expect(sanitizeSearchQuery("hello world")).toBe("hello world");
  });

  it("strips commas (PostgREST condition separator)", () => {
    expect(sanitizeSearchQuery("test,value")).toBe("testvalue");
  });

  it("strips parentheses (PostgREST operator syntax)", () => {
    expect(sanitizeSearchQuery("(test)")).toBe("test");
  });

  it("escapes percent signs", () => {
    expect(sanitizeSearchQuery("50% off")).toBe("50\\% off");
  });

  it("escapes backslashes", () => {
    expect(sanitizeSearchQuery("a\\b")).toBe("a\\\\b");
  });

  it("handles combined special characters", () => {
    const result = sanitizeSearchQuery("test,(50%)\\end");
    expect(result).toBe("test50\\%\\\\end");
  });

  it("handles combined with underscore and quote", () => {
    const result = sanitizeSearchQuery("user_name's (value)");
    expect(result).toBe("user\\_name''s value");
  });

  it("handles empty string", () => {
    expect(sanitizeSearchQuery("")).toBe("");
  });

  it("escapes underscores (ILIKE wildcard)", () => {
    expect(sanitizeSearchQuery("test_value")).toBe("test\\_value");
  });

  it("escapes single quotes", () => {
    expect(sanitizeSearchQuery("it's a test")).toBe("it''s a test");
  });

  it("handles combined special characters including underscore and quote", () => {
    const result = sanitizeSearchQuery("it's_a,test");
    expect(result).toBe("it''s\\_atest");
  });
});
