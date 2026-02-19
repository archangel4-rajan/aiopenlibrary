import Link from "next/link";
import { Trophy, TrendingUp, ArrowRight, Flame } from "lucide-react";
import { getLeaderboardPrompts, getUserSavedPromptIds } from "@/lib/db";
import { getUser } from "@/lib/auth";
import ModelBadge from "@/components/ModelBadge";
import SaveButton from "@/components/SaveButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard - AIOpenLibrary",
  description: "Discover the most popular prompts of the week.",
};

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900 dark:border-amber-800 dark:text-amber-200";
  if (rank === 2) return "bg-stone-50 border-stone-300 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300";
  if (rank === 3) return "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-800 dark:text-orange-200";
  return "bg-white border-stone-200 text-stone-500 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400";
}

function getRankBadge(rank: number) {
  if (rank === 1) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  if (rank === 2) return "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200";
  if (rank === 3) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  return "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300";
}

export default async function LeaderboardPage() {
  const [leaderboard, user] = await Promise.all([
    getLeaderboardPrompts(20),
    getUser(),
  ]);

  const savedIds = user ? await getUserSavedPromptIds(user.id) : [];

  const hasWeeklySaves = leaderboard.some((p) => p.weekly_saves > 0);

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Trophy className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
            {hasWeeklySaves
              ? "The most saved prompts this week"
              : "Most popular prompts of all time"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {hasWeeklySaves ? "Updated weekly" : "Based on total saves"}
          </div>
        </div>

        {/* Leaderboard List */}
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((prompt, index) => {
              const rank = index + 1;
              return (
                <div
                  key={prompt.id}
                  className={`group relative flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm sm:gap-4 sm:p-4 ${getRankStyle(rank)}`}
                >
                  <Link
                    href={`/prompts/${prompt.slug}`}
                    className="absolute inset-0 z-0 rounded-lg"
                  />

                  {/* Rank */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-10 sm:w-10 sm:text-sm ${getRankBadge(rank)}`}
                  >
                    {rank <= 3 ? (
                      <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      `#${rank}`
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300 sm:text-base">
                        {prompt.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
                      {prompt.description}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300 sm:px-2 sm:text-xs">
                        {prompt.category_name}
                      </span>
                      <span className="hidden sm:inline-flex">
                        <ModelBadge
                          model={prompt.recommended_model}
                          icon={prompt.model_icon}
                        />
                      </span>
                      <span className="hidden rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500 dark:bg-stone-700 dark:text-stone-400 sm:inline">
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="z-10 flex shrink-0 items-center gap-2 sm:gap-4">
                    {prompt.weekly_saves > 0 && (
                      <div className="hidden text-center sm:block">
                        <div className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {prompt.weekly_saves}
                        </div>
                        <div className="text-[10px] text-stone-400 dark:text-stone-500">
                          this week
                        </div>
                      </div>
                    )}
                    <SaveButton
                      promptId={prompt.id}
                      initialSaved={savedIds.includes(prompt.id)}
                      savesCount={prompt.saves_count}
                      size="sm"
                    />
                    <ArrowRight className="hidden h-4 w-4 text-stone-300 transition-colors group-hover:text-stone-500 dark:text-stone-600 dark:group-hover:text-stone-500 sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
            <Trophy className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
            <p className="mt-3 text-base text-stone-400 dark:text-stone-500">
              No leaderboard data available yet.
            </p>
            <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
              Save prompts to help them climb the leaderboard!
            </p>
            <Link
              href="/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600"
            >
              Browse Prompts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
