import Link from "next/link";
import { Lock, ArrowDown, Lightbulb, ArrowRight } from "lucide-react";
import type { ChainStepWithPrompt } from "@/lib/types";
import ModelBadge from "./ModelBadge";
import DifficultyBadge from "./DifficultyBadge";

interface ChainStepProps {
  step: ChainStepWithPrompt;
  stepNumber: number;
  isLocked: boolean;
  isLast?: boolean;
}

export default function ChainStep({
  step,
  stepNumber,
  isLocked,
  isLast = false,
}: ChainStepProps) {
  const title = step.title_override || step.prompt.title;

  return (
    <div className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-8"}`}>
      {/* Step number circle */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-sm font-bold text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          stepNumber
        )}
      </div>

      {/* Step content */}
      <div className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h3>
            {!isLocked && (
              <p className="mt-1 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                {step.prompt.description}
              </p>
            )}
          </div>
          {isLocked && (
            <span className="shrink-0 rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              Locked
            </span>
          )}
        </div>

        {!isLocked && (
          <>
            {/* Prompt preview */}
            {step.prompt.prompt && (
              <p className="mt-2 line-clamp-2 rounded bg-stone-50 px-2 py-1 font-mono text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400">
                {step.prompt.prompt.replace(/\{\{[^}]+\}\}/g, "[...]").slice(0, 120)}
                {step.prompt.prompt.length > 120 && "..."}
              </p>
            )}

            {/* Input instructions */}
            {step.input_instructions && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
                <ArrowDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {step.input_instructions}
                </p>
              </div>
            )}

            {/* Context note */}
            {step.context_note && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {step.context_note}
                </p>
              </div>
            )}

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-2">
              <ModelBadge model={step.prompt.recommended_model} icon={step.prompt.model_icon} />
              <DifficultyBadge difficulty={step.prompt.difficulty} />
              <Link
                href={`/prompts/${step.prompt.slug}`}
                className="ml-auto flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              >
                View Prompt <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
