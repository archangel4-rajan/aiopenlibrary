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

describe("validatePromptBody", () => {
  it("returns null for valid body", () => {
    expect(validatePromptBody(validBody)).toBeNull();
  });

  it("rejects missing slug", () => {
    const { slug, ...body } = validBody;
    expect(validatePromptBody(body)).toContain("slug");
  });

  it("rejects slug with uppercase", () => {
    expect(validatePromptBody({ ...validBody, slug: "Bad-Slug" })).toContain("lowercase");
  });

  it("rejects slug with spaces", () => {
    expect(validatePromptBody({ ...validBody, slug: "bad slug" })).toContain("lowercase");
  });

  it("rejects slug too short", () => {
    expect(validatePromptBody({ ...validBody, slug: "a" })).toContain("slug");
  });

  it("rejects title too short", () => {
    expect(validatePromptBody({ ...validBody, title: "X" })).toContain("title");
  });

  it("rejects missing title", () => {
    const { title, ...body } = validBody;
    expect(validatePromptBody(body)).toContain("title");
  });

  it("rejects description too short", () => {
    expect(validatePromptBody({ ...validBody, description: "Short" })).toContain("description");
  });

  it("rejects prompt too short", () => {
    expect(validatePromptBody({ ...validBody, prompt: "Short" })).toContain("prompt");
  });

  it("rejects missing category_id", () => {
    const { category_id, ...body } = validBody;
    expect(validatePromptBody(body)).toContain("category_id");
  });

  it("rejects non-array tags", () => {
    expect(validatePromptBody({ ...validBody, tags: "not-array" })).toContain("tags");
  });

  it("accepts missing tags (optional)", () => {
    const { tags, ...body } = validBody;
    expect(validatePromptBody(body)).toBeNull();
  });

  it("rejects invalid difficulty", () => {
    expect(validatePromptBody({ ...validBody, difficulty: "Expert" })).toContain("difficulty");
  });

  it("accepts missing difficulty (optional)", () => {
    const { difficulty, ...body } = validBody;
    expect(validatePromptBody(body)).toBeNull();
  });

  it("accepts all valid difficulties", () => {
    expect(validatePromptBody({ ...validBody, difficulty: "Beginner" })).toBeNull();
    expect(validatePromptBody({ ...validBody, difficulty: "Intermediate" })).toBeNull();
    expect(validatePromptBody({ ...validBody, difficulty: "Advanced" })).toBeNull();
  });
});
