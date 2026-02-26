/** Shared prompt body validation for admin and creator API routes. */
export function validatePromptBody(body: Record<string, unknown>): string | null {
  if (!body.slug || typeof body.slug !== "string" || body.slug.length < 2 || body.slug.length > 200) {
    return "slug is required and must be 2-200 characters";
  }
  if (!/^[a-z0-9-]+$/.test(body.slug as string)) {
    return "slug must contain only lowercase letters, numbers, and hyphens";
  }
  if (!body.title || typeof body.title !== "string" || body.title.length < 2 || body.title.length > 300) {
    return "title is required and must be 2-300 characters";
  }
  if (!body.description || typeof body.description !== "string" || body.description.length < 10) {
    return "description is required and must be at least 10 characters";
  }
  if (!body.prompt || typeof body.prompt !== "string" || body.prompt.length < 20) {
    return "prompt text is required and must be at least 20 characters";
  }
  if (!body.category_id || typeof body.category_id !== "string") {
    return "category_id is required";
  }
  if (body.tags && !Array.isArray(body.tags)) {
    return "tags must be an array";
  }
  if (body.difficulty && !["Beginner", "Intermediate", "Advanced"].includes(body.difficulty as string)) {
    return "difficulty must be Beginner, Intermediate, or Advanced";
  }
  return null;
}
