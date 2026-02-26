import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import {
  getPromptBySlug,
  getPromptsByCategory,
  isPromptSavedByUser,
  getUserSavedPromptIds,
  getUserVote,
  getRelatedPromptsByTags,
  getUserProfile,
  hasUserPurchasedPrompt,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import ModelBadge from "@/components/ModelBadge";
import SaveButton from "@/components/SaveButton";
import VoteButton from "@/components/VoteButton";
import ShareButtons from "@/components/ShareButtons";
import DifficultyBadge from "@/components/DifficultyBadge";
import TagLink from "@/components/TagLink";
import Breadcrumb from "@/components/Breadcrumb";
import PromptCard from "@/components/PromptCard";
import PromptCustomizer from "@/components/PromptCustomizer";
import CommentSection from "@/components/CommentSection";
import CreatorEditLink from "@/components/CreatorEditLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return {};

  const title = `${prompt.title} - AI Prompt`;
  const description = prompt.description || `${prompt.title} — a curated AI prompt for ${prompt.category_name}. Ready to use with ${prompt.recommended_model || "any AI model"}.`;
  const url = `https://aiopenlibrary.com/prompts/${prompt.slug}`;

  return {
    title,
    description,
    keywords: [
      ...(prompt.tags || []),
      prompt.category_name,
      "AI prompt",
      "prompt template",
      prompt.recommended_model,
    ].filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "AIOpenLibrary",
      publishedTime: prompt.created_at,
      modifiedTime: prompt.updated_at,
      tags: prompt.tags,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: prompt.title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [prompt, user] = await Promise.all([
    getPromptBySlug(slug),
    getUser(),
  ]);

  if (!prompt) {
    notFound();
  }

  const [isSaved, related, savedIds, userVote, crossCategoryRelated, creatorProfile, isPurchased] = await Promise.all([
    user ? isPromptSavedByUser(prompt.id, user.id) : Promise.resolve(false),
    getPromptsByCategory(prompt.category_slug).then((prompts) =>
      prompts.filter((p) => p.slug !== prompt.slug).slice(0, 3)
    ),
    user ? getUserSavedPromptIds(user.id) : Promise.resolve([]),
    user ? getUserVote(prompt.id, user.id) : Promise.resolve(null),
    getRelatedPromptsByTags(prompt.id, prompt.tags, prompt.category_slug),
    prompt.created_by ? getUserProfile(prompt.created_by) : Promise.resolve(null),
    user && prompt.is_premium ? hasUserPurchasedPrompt(user.id, prompt.id) : Promise.resolve(false),
  ]);

  const variables = (prompt.variables || []) as {
    name: string;
    description: string;
  }[];
  const references = (prompt.references || []) as {
    title: string;
    url: string;
  }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    description: prompt.description,
    url: `https://aiopenlibrary.com/prompts/${prompt.slug}`,
    datePublished: prompt.created_at,
    dateModified: prompt.updated_at,
    keywords: prompt.tags?.join(", "),
    genre: prompt.category_name,
    inLanguage: "en",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "AIOpenLibrary",
      url: "https://aiopenlibrary.com",
    },
    ...(prompt.likes_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: prompt.likes_count > prompt.dislikes_count ? 4.5 : 3.5,
        bestRating: 5,
        worstRating: 1,
        ratingCount: prompt.likes_count + prompt.dislikes_count,
      },
    }),
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
              { label: prompt.category_name, href: `/category/${prompt.category_slug}` },
              { label: prompt.title },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/category/${prompt.category_slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {prompt.category_name}
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
                  {prompt.title}
                </h1>
                {prompt.is_premium && (
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
                {prompt.description}
              </p>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                Updated {new Date(prompt.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <CreatorEditLink promptId={prompt.id} createdBy={prompt.created_by} />
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <SaveButton
                promptId={prompt.id}
                initialSaved={isSaved}
                savesCount={prompt.saves_count}
                size="md"
              />
              <VoteButton
                promptId={prompt.id}
                initialVote={userVote?.vote_type ?? null}
                likesCount={prompt.likes_count}
                dislikesCount={prompt.dislikes_count}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ModelBadge
              model={prompt.recommended_model}
              icon={prompt.model_icon}
            />
            <DifficultyBadge difficulty={prompt.difficulty} size="md" />
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <TagLink key={tag} tag={tag} showIcon={true} size="md" />
              ))}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mt-6">
            <ShareButtons
              url={`https://aiopenlibrary.com/prompts/${prompt.slug}`}
              title={prompt.title}
              promptId={prompt.id}
            />
          </div>
        </div>

        {/* Variables, Use Cases, and Prompt Content (interactive) */}
        <PromptCustomizer
          promptText={isPurchased ? prompt.prompt : prompt.prompt}
          variables={variables}
          useCases={prompt.use_cases || []}
          promptId={prompt.id}
          promptType={
            (prompt.tags || []).find((t: string) => t.startsWith("type:"))?.replace("type:", "") as
              | "text"
              | "image"
              | "video"
              | "unspecified"
              | undefined
          }
          isPremium={prompt.is_premium}
          premiumPreviewLength={prompt.premium_preview_length ?? undefined}
          zapPrice={prompt.zap_price ?? undefined}
          creatorId={prompt.created_by ?? undefined}
          isPurchased={isPurchased}
        />

        {/* Tips */}
        {prompt.tips && prompt.tips.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Pro Tips
            </h2>
            <div className="rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-5">
              <ul className="space-y-2">
                {prompt.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300"
                  >
                    <span className="mt-0.5 shrink-0 text-stone-400 dark:text-stone-500">&bull;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Output Screenshots or Example Output */}
        {prompt.example_output && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <ImageIcon className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              Prompt Output
            </h2>
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-5 overflow-x-auto">
              <pre className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words font-mono">
                <code>{prompt.example_output}</code>
              </pre>
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <ExternalLink className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              References
            </h2>
            <div className="space-y-2">
              {references.map((ref: { title: string; url: string }) => (
                <a
                  key={ref.url}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-sm text-stone-600 dark:text-stone-300 transition-colors hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-750"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  {ref.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mt-12 border-t border-stone-200 dark:border-stone-700 pt-8">
          <CommentSection promptId={prompt.id} />
        </div>

        {/* Related Prompts */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-stone-200 dark:border-stone-700 pt-12">
            <h2 className="mb-6 text-xl font-bold text-stone-900 dark:text-stone-100">
              More {prompt.category_name} Prompts
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PromptCard
                  key={p.slug}
                  prompt={p}
                  isSaved={savedIds.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cross-Category Related Prompts */}
        {crossCategoryRelated.length > 0 && (
          <div className="mt-12 border-t border-stone-200 dark:border-stone-700 pt-12">
            <h2 className="mb-6 text-xl font-bold text-stone-900 dark:text-stone-100">
              You Might Also Like
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {crossCategoryRelated.map((p) => (
                <PromptCard
                  key={p.slug}
                  prompt={p}
                  isSaved={savedIds.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
