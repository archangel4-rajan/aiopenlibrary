import Link from "next/link";
import { ArrowRight, Clock, Link2 } from "lucide-react";
import type { DbChain } from "@/lib/types";
import DifficultyBadge from "./DifficultyBadge";
import ChainSaveButton from "./ChainSaveButton";

interface ChainCardProps {
  chain: DbChain & {
    step_count: number;
    creator?: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  };
  isSaved?: boolean;
}

export default function ChainCard({ chain, isSaved = false }: ChainCardProps) {
  return (
    <div className="group relative flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600">
      <Link
        href={`/chains/${chain.slug}`}
        className="absolute inset-0 z-0 rounded-lg"
      />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Link2 className="h-3 w-3" />
            {chain.step_count} {chain.step_count === 1 ? "step" : "steps"}
          </span>
          {chain.category_name && (
            <span className="inline-flex items-center rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {chain.category_name}
            </span>
          )}
          {chain.is_premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              &#10022; Premium
            </span>
          )}
        </div>
        <div className="relative z-10">
          <ChainSaveButton
            chainSlug={chain.slug}
            isSaved={isSaved}
            savesCount={chain.saves_count}
          />
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
        {chain.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-300">
        {chain.description}
      </p>

      {chain.estimated_minutes && (
        <div className="mb-3 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          <Clock className="h-3 w-3" />
          ~{chain.estimated_minutes} min
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {chain.tags && chain.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chain.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-500 dark:bg-stone-800 dark:text-stone-400"
              >
                {tag}
              </span>
            ))}
            {chain.tags.length > 3 && (
              <span className="rounded bg-stone-50 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800 dark:text-stone-400">
                +{chain.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={chain.difficulty} />
            {chain.zap_price && chain.zap_price > 0 && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                ⚡ {chain.zap_price}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-stone-500">
            View chain <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
