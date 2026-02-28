import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff, PenTool, Bookmark, Heart, TrendingUp, Zap, Package, Trash2, Link2 } from "lucide-react";
import { isCreator, getUser } from "@/lib/auth";
import { getPromptsByCreator, getCreatorDetailedStats, getPacksByCreator, getZapBalance, getChainsByCreator } from "@/lib/db";
import CreatorDeleteButton from "@/components/CreatorDeleteButton";
import CreatorPackDeleteButton from "@/components/CreatorPackDeleteButton";
import ChainDeleteButton from "@/components/ChainDeleteButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Dashboard - AIOpenLibrary",
};

export default async function CreatorPage() {
  const creator = await isCreator();
  if (!creator) {
    redirect("/");
  }

  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  const [prompts, stats, packs, chains, zapBalanceData] = await Promise.all([
    getPromptsByCreator(user.id),
    getCreatorDetailedStats(user.id),
    getPacksByCreator(user.id),
    getChainsByCreator(user.id),
    getZapBalance(user.id),
  ]);

  // Get step counts for chains
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const chainIds = chains.map((c) => c.id);
  let chainStepCounts: Record<string, number> = {};
  if (chainIds.length > 0) {
    const { data: steps } = await supabase
      .from("prompt_chain_steps")
      .select("chain_id")
      .in("chain_id", chainIds);
    if (steps) {
      for (const s of steps) {
        chainStepCounts[s.chain_id] = (chainStepCounts[s.chain_id] || 0) + 1;
      }
    }
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenTool className="h-6 w-6 text-stone-600 dark:text-stone-400" />
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Creator Dashboard
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Manage your prompts
              </p>
            </div>
          </div>
          <Link
            href="/creator/prompts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            <Plus className="h-4 w-4" />
            New Prompt
          </Link>
        </div>

        {/* Stats Row 1 */}
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Total Prompts</p>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.totalPrompts}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Published</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.publishedCount}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Drafts</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.draftCount}
            </p>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Saves</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.totalSaves}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Likes</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.totalLikes}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <p className="text-sm text-amber-600 dark:text-amber-400">Zaps Earned</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
              {zapBalanceData?.total_earned ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Top Prompt</p>
            </div>
            {stats.topPrompt ? (
              <Link
                href={`/prompts/${stats.topPrompt.slug}`}
                className="mt-1 block truncate text-sm font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-400"
              >
                {stats.topPrompt.title}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">—</p>
            )}
          </div>
        </div>

        {/* Your Top Prompts */}
        {prompts.filter((p) => p.is_published).length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Your Top Prompts
            </h2>
            <div className="rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
              {prompts
                .filter((p) => p.is_published)
                .sort((a, b) => b.saves_count - a.saves_count)
                .slice(0, 5)
                .map((prompt, i) => (
                  <div
                    key={prompt.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i > 0 ? "border-t border-stone-100 dark:border-stone-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                        #{i + 1}
                      </span>
                      <Link
                        href={`/prompts/${prompt.slug}`}
                        className="text-sm font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-400"
                      >
                        {prompt.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" /> {prompt.saves_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {prompt.likes_count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Packs Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <Package className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              Your Packs
            </h2>
            <Link
              href="/creator/packs/new"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Pack
            </Link>
          </div>

          {packs.length > 0 ? (
            <div className="space-y-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {pack.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                      ⚡ {pack.zap_price} Zaps · {pack.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/creator/packs/${pack.id}/edit`}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <CreatorPackDeleteButton packId={pack.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-stone-200 p-6 text-center dark:border-stone-700">
              <p className="text-sm text-stone-400 dark:text-stone-500">
                No packs yet. Bundle your prompts into packs for buyers.
              </p>
            </div>
          )}
        </div>

        {/* Prompts Table */}
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800">
                <th className="px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400 sm:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400 md:table-cell">
                  Model
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600 dark:text-stone-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600 dark:text-stone-400">
                  Saves
                </th>
                <th className="px-4 py-3 text-right font-semibold text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  className="border-t border-stone-100 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/prompts/${prompt.slug}`}
                      className="font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-400"
                    >
                      {prompt.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 dark:text-stone-400 sm:table-cell">
                    {prompt.category_name}
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 dark:text-stone-400 md:table-cell">
                    {prompt.recommended_model}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {prompt.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <Eye className="h-3 w-3" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500 dark:text-stone-400">
                    {prompt.saves_count}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/creator/prompts/${prompt.id}/edit`}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <CreatorDeleteButton promptId={prompt.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
