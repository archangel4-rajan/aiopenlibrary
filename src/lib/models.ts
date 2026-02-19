/**
 * Canonical model registry for AIOpenLibrary.
 *
 * All supported AI model names, icons, and providers are defined here
 * as the single source of truth. Components like ModelBadge and PromptForm
 * consume this registry rather than maintaining their own lists.
 */

export interface ModelDefinition {
  /** Display name shown in UI (e.g. "Claude Opus 4") */
  name: string;
  /** Provider key used by ModelBadge for icon rendering */
  icon: "anthropic" | "openai" | "google" | "xai" | "meta" | "other";
  /** Human-readable provider name */
  provider: string;
}

export const MODELS: Record<string, ModelDefinition> = {
  "claude-opus-4": {
    name: "Claude Opus 4",
    icon: "anthropic",
    provider: "Anthropic",
  },
  "claude-sonnet-4": {
    name: "Claude Sonnet 4",
    icon: "anthropic",
    provider: "Anthropic",
  },
  "claude-haiku-3.5": {
    name: "Claude Haiku 3.5",
    icon: "anthropic",
    provider: "Anthropic",
  },
  "gpt-4o": {
    name: "GPT-4o",
    icon: "openai",
    provider: "OpenAI",
  },
  "gpt-4o-mini": {
    name: "GPT-4o mini",
    icon: "openai",
    provider: "OpenAI",
  },
  o3: {
    name: "o3",
    icon: "openai",
    provider: "OpenAI",
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    icon: "google",
    provider: "Google",
  },
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    icon: "google",
    provider: "Google",
  },
  "grok-4.20": {
    name: "Grok 4.20",
    icon: "xai",
    provider: "xAI",
  },
  "llama-3.3": {
    name: "Llama 3.3",
    icon: "meta",
    provider: "Meta",
  },
};

/** Returns all model display names for use in dropdowns. */
export function getModelNames(): string[] {
  return Object.values(MODELS).map((m) => m.name);
}

/** Looks up the icon key for a given model display name. */
export function getModelIcon(modelName: string): string {
  const entry = Object.values(MODELS).find((m) => m.name === modelName);
  return entry?.icon ?? "other";
}

/** Looks up the provider for a given model display name. */
export function getModelProvider(modelName: string): string {
  const entry = Object.values(MODELS).find((m) => m.name === modelName);
  return entry?.provider ?? "Unknown";
}
