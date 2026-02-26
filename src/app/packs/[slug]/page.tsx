import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPackBySlug, getPackItems, getUserProfile, hasUserPurchasedPack, getUserPurchasedPromptIds } from "@/lib/db";
import { getUser } from "@/lib/auth";
import PackPurchaseButton from "@/components/PackPurchaseButton";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return {};

  return {
    title: `${pack.name} - Prompt Pack - AIOpenLibrary`,
    description: pack.description,
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);

  if (!pack || !pack.is_published) {
    notFound();
  }

  const [prompts, creator, user] = await Promise.all([
    getPackItems(pack.id),
    getUserProfile(pack.creator_id),
    getUser(),
  ]);

  let isPurchased = false;
  let purchasedPromptIds: string[] = [];
  if (user) {
    [isPurchased, purchasedPromptIds] = await Promise.all([
      hasUserPurchasedPack(user.id, pack.id),
      getUserPurchasedPromptIds(user.id),
    ]);
  }

  // Calculate savings
  const individualTotal = prompts.reduce((sum, p) => sum + (p.zap_price ?? 0), 0);
  const savings = individualTotal - pack.zap_price;

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/packs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packs
        </Link>

        {/* Header */}
        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
            {pack.name}
          </h1>

          {creator && (
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              By{" "}
              {creator.username ? (
                <Link
                  href={`/creators/${creator.username}`}
                  className="font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                >
                  {creator.display_name || creator.username}
                </Link>
              ) : (
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {creator.display_name || "Creator"}
                </span>
              )}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300">
            {pack.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ⚡ {pack.zap_price}
              </span>
              <span className="text-sm text-stone-400 dark:text-stone-500">Zaps</span>
            </div>

            {savings > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                Save {savings} Zaps vs buying individually
              </span>
            )}

            <span className="text-sm text-stone-400 dark:text-stone-500">
              {prompts.length} prompts
            </span>
          </div>

          <div className="mt-6">
            <PackPurchaseButton
              packId={pack.id}
              zapPrice={pack.zap_price}
              isPurchased={isPurchased}
            />
          </div>
        </div>

        {/* Prompts List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Included Prompts
          </h2>
          <div className="space-y-3">
            {prompts.map((prompt) => {
              const isPromptPurchased = isPurchased || purchasedPromptIds.includes(prompt.id);
              return (
                <div
                  key={prompt.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {isPromptPurchased ? (
                        <Link
                          href={`/prompts/${prompt.slug}`}
                          className="text-sm font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-300"
                        >
                          {prompt.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {prompt.title}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        {prompt.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {prompt.zap_price && prompt.zap_price > 0 && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          ⚡ {prompt.zap_price}
                        </span>
                      )}
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                        {prompt.category_name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
