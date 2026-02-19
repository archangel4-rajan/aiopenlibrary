import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import ModelBadge from "./ModelBadge";
import SaveButton from "./SaveButton";

interface PromptCardProps {
  prompt: DbPrompt;
  isSaved?: boolean;
}

export default function PromptCard({ prompt, isSaved = false }: PromptCardProps) {
  return (
    <div className="group relative flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm">
      <Link
        href={`/prompts/${prompt.slug}`}
        className="absolute inset-0 z-0 rounded-lg"
      />

      <div className="mb-3 flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
          <span>{getCategoryIcon(prompt.category_slug)}</span>
          {prompt.category_name}
        </span>
        <div className="relative z-10">
          <SaveButton
            promptId={prompt.id}
            initialSaved={isSaved}
            savesCount={prompt.saves_count}
            size="sm"
          />
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600">
        {prompt.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-stone-500">
        {prompt.description}
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <ModelBadge model={prompt.recommended_model} icon={prompt.model_icon} />

        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              prompt.difficulty === "Beginner"
                ? "bg-stone-100 text-stone-600"
                : prompt.difficulty === "Intermediate"
                ? "bg-stone-100 text-stone-600"
                : "bg-stone-200 text-stone-700"
            }`}
          >
            {prompt.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400 opacity-0 transition-opacity group-hover:opacity-100">
            View prompt <ArrowRight className="h-3 w-3" />
          </span>
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
    "product-management": "🚀",
    research: "🔬",
    openclaw: "🦞",
    "video-creation": "🎬",
    planning: "📋",
  };
  return icons[slug] || "📝";
}
