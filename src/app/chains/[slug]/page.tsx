import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Link2, PlayCircle, Target } from "lucide-react";
import {
  getChainBySlug,
  getChainSteps,
  getUserSavedChainIds,
  getUserChainVotes,
  getUserProfile,
  hasUserPurchasedChain,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import Breadcrumb from "@/components/Breadcrumb";
import ChainTimeline from "@/components/ChainTimeline";
import ChainSaveButton from "@/components/ChainSaveButton";
import ChainVoteButtons from "@/components/ChainVoteButtons";
import ChainUnlockButton from "@/components/ChainUnlockButton";
import ChainCommentSection from "@/components/ChainCommentSection";
import ShareButtons from "@/components/ShareButtons";
import DifficultyBadge from "@/components/DifficultyBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chain = await getChainBySlug(slug);
  if (!chain) return {};

  const title = `${chain.title} — Prompt Chain | AIOpenLibrary`;
  const description =
    chain.description ||
    `${chain.title} — a multi-step AI workflow on AIOpenLibrary.`;
  const url = `https://aiopenlibrary.com/chains/${chain.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "AIOpenLibrary",
      publishedTime: chain.created_at,
      modifiedTime: chain.updated_at,
      tags: chain.tags,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ChainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [chain, user] = await Promise.all([
    getChainBySlug(slug),
    getUser(),
  ]);

  if (!chain || (!chain.is_published && !user)) {
    notFound();
  }

  const [steps, savedChainIds, userVotes, creatorProfile, isPurchased] =
    await Promise.all([
      getChainSteps(chain.id),
      user ? getUserSavedChainIds(user.id) : Promise.resolve([]),
      user ? getUserChainVotes(user.id) : Promise.resolve({} as Record<string, "like" | "dislike">),
      chain.created_by ? getUserProfile(chain.created_by) : Promise.resolve(null),
      user && chain.is_premium
        ? hasUserPurchasedChain(user.id, chain.id)
        : Promise.resolve(false),
    ]);

  const isSaved = savedChainIds.includes(chain.id);
  const userVote = userVotes[chain.id] ?? null;
  const totalMinutes = chain.estimated_minutes || steps.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0);
  const isOwner = user && chain.created_by === user.id;
  const canRun = !chain.is_premium || isPurchased || isOwner;

  // HowTo JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: chain.title,
    description: chain.description,
    url: `https://aiopenlibrary.com/chains/${chain.slug}`,
    ...(totalMinutes > 0 && { totalTime: `PT${totalMinutes}M` }),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title_override || s.prompt.title,
      text: s.prompt.description,
      ...(s.estimated_minutes && { timeRequired: `PT${s.estimated_minutes}M` }),
    })),
    publisher: {
      "@type": "Organization",
      name: "AIOpenLibrary",
      url: "https://aiopenlibrary.com",
    },
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Chains", href: "/chains" },
              { label: chain.title },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/chains"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chains
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
                  {chain.title}
                </h1>
                {chain.is_premium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    &#10022; Premium
                  </span>
                )}
              </div>
              {creatorProfile && (
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  By{" "}
                  {creatorProfile.username ? (
                    <Link
                      href={`/creators/${creatorProfile.username}`}
                      className="font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                    >
                      {creatorProfile.display_name || creatorProfile.username}
                    </Link>
                  ) : (
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {creatorProfile.display_name || "Creator"}
                    </span>
                  )}
                </p>
              )}
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300">
                {chain.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <ChainSaveButton
                chainSlug={chain.slug}
                isSaved={isSaved}
                savesCount={chain.saves_count}
                size="md"
              />
              <ChainVoteButtons
                chainSlug={chain.slug}
                likesCount={chain.likes_count}
                dislikesCount={chain.dislikes_count}
                userVote={userVote}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Link2 className="h-3.5 w-3.5" />
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
            {totalMinutes > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                <Clock className="h-3.5 w-3.5" />
                ~{totalMinutes} min
              </span>
            )}
            {chain.category_name && (
              <span className="inline-flex items-center rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {chain.category_name}
              </span>
            )}
            <DifficultyBadge difficulty={chain.difficulty} size="md" />
          </div>

          {/* Tags */}
          {chain.tags && chain.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chain.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Use cases */}
          {chain.use_cases && chain.use_cases.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300">
                <Target className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                Use Cases
              </h3>
              <ul className="space-y-1.5">
                {chain.use_cases.map((uc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400"
                  >
                    <span className="mt-0.5 shrink-0 text-stone-400 dark:text-stone-500">
                      &bull;
                    </span>
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA + Unlock */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canRun ? (
              <Link
                href={`/chains/${chain.slug}/run`}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                <PlayCircle className="h-4 w-4" />
                Run This Chain
              </Link>
            ) : null}

            {chain.is_premium && !isPurchased && chain.zap_price && chain.created_by && !isOwner && (
              <ChainUnlockButton
                chainSlug={chain.slug}
                zapPrice={chain.zap_price}
                creatorId={chain.created_by}
                isPurchased={isPurchased}
              />
            )}
          </div>

          {/* Share buttons */}
          <div className="mt-6">
            <ShareButtons
              url={`https://aiopenlibrary.com/chains/${chain.slug}`}
              title={chain.title}
            />
          </div>
        </div>

        {/* Chain Timeline */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-stone-900 dark:text-stone-100">
            Chain Steps
          </h2>
          <ChainTimeline
            steps={steps}
            isPurchased={isPurchased || !!isOwner}
            isPremium={chain.is_premium}
          />
        </div>

        {/* Comments */}
        <div className="border-t border-stone-200 pt-8 dark:border-stone-700">
          <ChainCommentSection chainSlug={chain.slug} />
        </div>
      </div>
    </div>
  );
}
