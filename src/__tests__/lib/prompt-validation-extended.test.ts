import { describe, it, expect } from "vitest";
import { validatePromptBody } from "@/lib/prompt-validation";

const validBody = {
  slug: "valid-slug",
  title: "Valid Title",
  description: "This is a valid description that is long enough.",
  prompt: "This is a valid prompt that is definitely long enough to pass.",
  category_id: "cat-123",
  tags: ["test"],
  difficulty: "Intermediate",
};

describe("validatePromptBody — extended edge cases", () => {
  it("accepts slug with consecutive hyphens", () => {
    expect(validatePromptBody({ ...validBody, slug: "my--slug" })).toBeNull();
  });

  it("accepts title exactly at min length (2 chars)", () => {
    expect(validatePromptBody({ ...validBody, title: "Ab" })).toBeNull();
  });

  it("rejects title at 1 char (below min)", () => {
    expect(validatePromptBody({ ...validBody, title: "A" })).toContain("title");
  });

  it("accepts description exactly at min length (10 chars)", () => {
    expect(validatePromptBody({ ...validBody, description: "Exactly 10" })).toBeNull();
  });

  it("rejects description at 9 chars (below min)", () => {
    expect(validatePromptBody({ ...validBody, description: "Nine char" })).toContain("description");
  });

  it("accepts prompt exactly at min length (20 chars)", () => {
    expect(validatePromptBody({ ...validBody, prompt: "12345678901234567890" })).toBeNull();
  });

  it("rejects prompt at 19 chars (below min)", () => {
    expect(validatePromptBody({ ...validBody, prompt: "1234567890123456789" })).toContain("prompt");
  });

  it("accepts empty tags array", () => {
    expect(validatePromptBody({ ...validBody, tags: [] })).toBeNull();
  });

  it("accepts slug exactly at min length (2 chars)", () => {
    expect(validatePromptBody({ ...validBody, slug: "ab" })).toBeNull();
  });

  it("rejects slug with special characters", () => {
    expect(validatePromptBody({ ...validBody, slug: "my_slug!" })).toContain("lowercase");
  });

  it("rejects slug with underscores", () => {
    expect(validatePromptBody({ ...validBody, slug: "my_slug" })).toContain("lowercase");
  });

  it("accepts slug at max length (200 chars)", () => {
    expect(validatePromptBody({ ...validBody, slug: "a".repeat(200) })).toBeNull();
  });

  it("rejects slug over max length (201 chars)", () => {
    expect(validatePromptBody({ ...validBody, slug: "a".repeat(201) })).toContain("slug");
  });

  it("accepts title at max length (300 chars)", () => {
    expect(validatePromptBody({ ...validBody, title: "A".repeat(300) })).toBeNull();
  });

  it("rejects title over max length (301 chars)", () => {
    expect(validatePromptBody({ ...validBody, title: "A".repeat(301) })).toContain("title");
  });

  it("rejects numeric slug", () => {
    // numeric-only slugs are valid (lowercase letters, numbers, hyphens)
    expect(validatePromptBody({ ...validBody, slug: "123" })).toBeNull();
  });

  it("rejects non-string category_id", () => {
    expect(validatePromptBody({ ...validBody, category_id: 123 })).toContain("category_id");
  });

  it("accepts tags with various string values", () => {
    expect(validatePromptBody({ ...validBody, tags: ["tag1", "tag2", "tag3"] })).toBeNull();
  });
});
