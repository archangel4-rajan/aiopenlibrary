import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import ModelBadge from "./ModelBadge";
import SaveButton from "./SaveButton";
import DifficultyBadge from "./DifficultyBadge";
import TagLink from "./TagLink";

interface PromptCardProps {
  prompt: DbPrompt;
  isSaved?: boolean;
  isPurchased?: boolean;
  showCategory?: boolean;
  creator?: {
    display_name: string | null;
    username: string | null;
  } | null;
}

function isNew(dateStr: string): boolean {
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

/** Extract variable names from {{variable_name}} syntax in prompt text. */
function extractVariables(promptText: string): string[] {
  const matches = promptText.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const seen = new Set<string>();
  return matches
    .map((m) => m.replace(/\{\{|\}\}/g, "").trim().replace(/_/g, " "))
    .filter((v) => {
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    })
    .slice(0, 4);
}

export default function PromptCard({
  prompt,
  isSaved = false,
  isPurchased,
  showCategory = true,
  creator,
}: PromptCardProps) {
  const variables = extractVariables(prompt.prompt);

  return (
    <div className="group relative flex flex-col rounded-lg border border-stone-200 bg-white p-4 sm:p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600">
      <Link
        href={`/prompts/${prompt.slug}`}
        className="absolute inset-0 z-0 rounded-lg"
      />

      <div className="mb-2 sm:mb-3 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              <span>{getCategoryIcon(prompt.category_slug)}</span>
              {prompt.category_name}
            </span>
          )}
          {isNew(prompt.created_at) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Sparkles className="h-2.5 w-2.5" />
              NEW
            </span>
          )}
          {prompt.is_premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              &#10022; Premium
            </span>
          )}
          {isPurchased && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              &#10003; Owned
            </span>
          )}
        </div>
        <div className="relative z-10">
          <SaveButton
            promptId={prompt.id}
            initialSaved={isSaved}
            savesCount={prompt.saves_count}
            size="sm"
          />
        </div>
      </div>

      <h3 className="mb-1 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
        {prompt.title}
      </h3>
      {creator && (creator.display_name || creator.username) && (
        <p className="mb-2 text-xs text-stone-400 dark:text-stone-500">
          by {creator.display_name || creator.username}
        </p>
      )}
      <p className="mb-2 sm:mb-3 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-300">
        {prompt.description}
      </p>

      {/* Variable chips — show what's customizable */}
      {variables.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <span
              key={v}
              className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <ModelBadge model={prompt.recommended_model} icon={prompt.model_icon} />

        <div className="relative z-10 flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 3).map((tag, i) => (
            <span key={tag} className={i === 2 ? "hidden sm:inline-flex" : undefined}>
              <TagLink tag={tag} size="sm" />
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="hidden rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400 sm:inline">
              +{prompt.tags.length - 3}
            </span>
          )}
          {prompt.tags.length > 2 && (
            <span className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400 sm:hidden">
              +{prompt.tags.length - 2}
            </span>
          )}
        </div>

        <div className="border-t border-stone-100 pt-3 dark:border-stone-700">
          <DifficultyBadge difficulty={prompt.difficulty} />
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    "software-engineering": "💻",
    "writing-content": "✍️",
    "data-science": "📊",
    marketing: "📣",
    "design-ux": "🎨",
    education: "📚",
    "product-management": "📦",
    research: "🔬",
    openclaw: "🦞",
    "video-creation": "🎬",
    planning: "📋",
    "business-strategy": "📈",
    "career-development": "🎯",
    "celebrity-shared": "⭐",
    creative: "✨",
    finance: "💰",
    "health-wellness": "💪",
    legal: "⚖️",
    "prompt-engineering": "🔧",
    sales: "🤝",
    skills: "🛠️",
    startup: "🚀",
    "ai-image-generation": "🖼️",
    "productivity-automation": "⚡",
    cybersecurity: "🔒",
    "communication-email": "✉️",
    "language-translation": "🌍",
    "food-cooking": "🍳",
    "travel-adventure": "✈️",
    "parenting-family": "👨‍👩‍👧‍👦",
    "personal-development": "🌱",
    "hr-people-ops": "👥",
    "fun-games": "🎮",
    "software-architecture": "🏗️",
  };
  return icons[slug] || "📝";
}
