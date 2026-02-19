import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Tag,
  ImageIcon,
} from "lucide-react";
import {
  getPromptBySlug,
  getPromptsByCategory,
  isPromptSavedByUser,
  getUserSavedPromptIds,
  getUserVote,
  getRelatedPromptsByTags,
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return {};
  return {
    title: `${prompt.title} - AIOpenLibrary`,
    description: prompt.description,
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

  const [isSaved, related, savedIds, userVote, crossCategoryRelated] = await Promise.all([
    user ? isPromptSavedByUser(prompt.id, user.id) : Promise.resolve(false),
    getPromptsByCategory(prompt.category_slug).then((prompts) =>
      prompts.filter((p) => p.slug !== prompt.slug).slice(0, 3)
    ),
    user ? getUserSavedPromptIds(user.id) : Promise.resolve([]),
    user ? getUserVote(prompt.id, user.id) : Promise.resolve(null),
    getRelatedPromptsByTags(prompt.id, prompt.tags, prompt.category_slug),
  ]);

  const variables = (prompt.variables || []) as {
    name: string;
    description: string;
  }[];
  const references = (prompt.references || []) as {
    title: string;
    url: string;
  }[];

  return (
    <div className="bg-white dark:bg-stone-900">
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
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {prompt.category_name}
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
                {prompt.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-stone-400">
                {prompt.description}
              </p>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                Updated {new Date(prompt.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
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
              description={prompt.description}
            />
          </div>
        </div>

        {/* Variables, Use Cases, and Prompt Content (interactive) */}
        <PromptCustomizer
          promptText={prompt.prompt}
          variables={variables}
          useCases={prompt.use_cases || []}
        />

        {/* Tips */}
        {prompt.tips && prompt.tips.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Pro Tips
            </h2>
            <div className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-5">
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
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
            <ImageIcon className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            Prompt Output
          </h2>
          {prompt.example_output ? (
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 overflow-x-auto">
              <pre className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words font-mono">
                <code>{prompt.example_output}</code>
              </pre>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-8 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
                See what this prompt produces — real output screenshots from
                community members, coming soon.
              </p>
            </div>
          )}
        </div>

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
                  className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 text-sm text-stone-600 dark:text-stone-300 transition-colors hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-750"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  {ref.title}
                </a>
              ))}
            </div>
          </div>
        )}

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
