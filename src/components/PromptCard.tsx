import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import ModelBadge from "./ModelBadge";
import SaveButton from "./SaveButton";
import DifficultyBadge from "./DifficultyBadge";
import TagLink from "./TagLink";

interface PromptCardProps {
  prompt: DbPrompt;
  isSaved?: boolean;
  isPurchased?: boolean;
}

function isNew(dateStr: string): boolean {
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

export default function PromptCard({ prompt, isSaved = false, isPurchased }: PromptCardProps) {
  const promptPreview = prompt.prompt.replace(/\{\{[^}]+\}\}/g, "[...]").slice(0, 80);

  return (
    <div className="group relative flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600">
      <Link
        href={`/prompts/${prompt.slug}`}
        className="absolute inset-0 z-0 rounded-lg"
      />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            <span>{getCategoryIcon(prompt.category_slug)}</span>
            {prompt.category_name}
          </span>
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

      <h3 className="mb-2 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
        {prompt.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-300">
        {prompt.description}
      </p>

      {/* Prompt preview snippet */}
      <p className="mb-4 line-clamp-1 rounded bg-stone-50 px-2 py-1 font-mono text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400">
        {promptPreview}
        {prompt.prompt.length > 80 && "..."}
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <ModelBadge model={prompt.recommended_model} icon={prompt.model_icon} />

        <div className="relative z-10 flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 3).map((tag) => (
            <TagLink key={tag} tag={tag} size="sm" />
          ))}
          {prompt.tags.length > 3 && (
            <span className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-700">
          <DifficultyBadge difficulty={prompt.difficulty} />
          <span className="flex items-center gap-1 text-xs text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-stone-500">
            View prompt <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    "software-engineering": "\uD83D\uDCBB",
    "writing-content": "\u270D\uFE0F",
    "data-science": "\uD83D\uDCCA",
    marketing: "\uD83D\uDCE3",
    "design-ux": "\uD83C\uDFA8",
    education: "\uD83D\uDCDA",
    "product-management": "\uD83D\uDE80",
    research: "\uD83D\uDD2C",
    openclaw: "\uD83E\uDD9E",
    "video-creation": "\uD83C\uDFAC",
    planning: "\uD83D\uDCCB",
  };
  return icons[slug] || "\uD83D\uDCDD";
}
