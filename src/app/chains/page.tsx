import { Link2 } from "lucide-react";
import { getPublishedChains, getUserSavedChainIds, getCategories } from "@/lib/db";
import { getUser } from "@/lib/auth";
import ChainCard from "@/components/ChainCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Chains — Step-by-Step AI Workflows | AIOpenLibrary",
  description:
    "Discover curated prompt chains — multi-step AI workflows that guide you through complex tasks step by step.",
  alternates: {
    canonical: "https://aiopenlibrary.com/chains",
  },
};

export default async function ChainsPage() {
  const [chains, user, categories] = await Promise.all([
    getPublishedChains(),
    getUser(),
    getCategories(),
  ]);

  const savedChainIds = user ? await getUserSavedChainIds(user.id) : [];

  // Get step counts via API-like inline approach
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const chainIds = chains.map((c) => c.id);
  let stepCounts: Record<string, number> = {};

  if (chainIds.length > 0) {
    const { data: steps } = await supabase
      .from("prompt_chain_steps")
      .select("chain_id")
      .in("chain_id", chainIds);

    if (steps) {
      for (const s of steps) {
        stepCounts[s.chain_id] = (stepCounts[s.chain_id] || 0) + 1;
      }
    }
  }

  // Get creator profiles
  const creatorIds = [...new Set(chains.map((c) => c.created_by).filter(Boolean))] as string[];
  let creatorMap: Record<string, { display_name: string | null; username: string | null; avatar_url: string | null }> = {};

  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", creatorIds);

    if (profiles) {
      for (const p of profiles) {
        creatorMap[p.id] = { display_name: p.display_name, username: p.username, avatar_url: p.avatar_url };
      }
    }
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Link2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
              Prompt Chains
            </h1>
          </div>
          <p className="max-w-2xl text-base text-stone-600 dark:text-stone-400">
            Multi-step AI workflows that guide you through complex tasks. Each chain
            connects prompts in sequence, building on outputs from previous steps.
          </p>
        </div>

        {/* Chains grid */}
        {chains.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chains.map((chain) => (
              <ChainCard
                key={chain.id}
                chain={{
                  ...chain,
                  step_count: stepCounts[chain.id] || 0,
                  creator: chain.created_by ? creatorMap[chain.created_by] || null : null,
                }}
                isSaved={savedChainIds.includes(chain.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 px-8 py-16 text-center dark:border-stone-700">
            <Link2 className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
            <h3 className="mt-4 text-lg font-semibold text-stone-600 dark:text-stone-400">
              No chains yet
            </h3>
            <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
              Prompt chains will appear here once creators publish them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
