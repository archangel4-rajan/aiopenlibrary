import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Tag,
  Lightbulb,
  Variable,
  ImageIcon,
} from "lucide-react";
import {
  getPromptBySlug,
  getPromptsByCategory,
  isPromptSavedByUser,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import ModelBadge from "@/components/ModelBadge";
import CopyButton from "@/components/CopyButton";
import SaveButton from "@/components/SaveButton";
import PromptCard from "@/components/PromptCard";

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

  const [isSaved, related, savedIds] = await Promise.all([
    user ? isPromptSavedByUser(prompt.id, user.id) : Promise.resolve(false),
    getPromptsByCategory(prompt.category_slug).then((prompts) =>
      prompts.filter((p) => p.slug !== prompt.slug).slice(0, 3)
    ),
    user ? getUserSavedPromptIds(user.id) : Promise.resolve([]),
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
    <div className="bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-stone-400">
          <Link href="/" className="hover:text-stone-600">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/category/${prompt.category_slug}`}
            className="hover:text-stone-600"
          >
            {prompt.category_name}
          </Link>
          <span>/</span>
          <span className="text-stone-600">{prompt.title}</span>
        </nav>

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
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
                {prompt.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-500">
                {prompt.description}
              </p>
            </div>
            <div className="shrink-0">
              <SaveButton
                promptId={prompt.id}
                initialSaved={isSaved}
                savesCount={prompt.saves_count}
                size="md"
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ModelBadge
              model={prompt.recommended_model}
              icon={prompt.model_icon}
            />
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">
              {prompt.difficulty}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
              Prompt
            </h2>
            <CopyButton
              text={prompt.prompt}
              className="px-4 py-2 text-sm font-medium"
            />
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-5 font-mono text-sm leading-relaxed text-stone-700">
            {prompt.prompt}
          </pre>
        </div>

        {/* Variables */}
        {variables.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <Variable className="h-5 w-5 text-stone-500" />
              Variables to Customize
            </h2>
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="px-4 py-3 text-left font-medium text-stone-600">
                      Variable
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-stone-600">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variables.map(
                    (v: { name: string; description: string }) => (
                      <tr key={v.name} className="border-t border-stone-100">
                        <td className="px-4 py-3">
                          <code className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-700">
                            {`{{${v.name}}}`}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {v.description}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Use Cases */}
        {prompt.use_cases && prompt.use_cases.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <Lightbulb className="h-5 w-5 text-stone-500" />
              Use Cases
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {prompt.use_cases.map((useCase) => (
                <div
                  key={useCase}
                  className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600">
                    &#10003;
                  </div>
                  <span className="text-sm text-stone-600">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {prompt.tips && prompt.tips.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">
              Pro Tips
            </h2>
            <div className="rounded-lg border border-stone-300 bg-white p-5">
              <ul className="space-y-2">
                {prompt.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-sm text-stone-600"
                  >
                    <span className="mt-0.5 shrink-0 text-stone-400">&bull;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Output Screenshots placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
            <ImageIcon className="h-5 w-5 text-stone-500" />
            Prompt Output
          </h2>
          <div className="rounded-lg border-2 border-dashed border-stone-200 bg-white p-8 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-2 text-sm text-stone-400">
              Output screenshots coming soon. Community members will be able to
              share results from using this prompt.
            </p>
          </div>
        </div>

        {/* References */}
        {references.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <ExternalLink className="h-5 w-5 text-stone-500" />
              References
            </h2>
            <div className="space-y-2">
              {references.map((ref: { title: string; url: string }) => (
                <a
                  key={ref.url}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
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
          <div className="mt-12 border-t border-stone-200 pt-12">
            <h2 className="mb-6 text-xl font-bold text-stone-900">
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
      </div>
    </div>
  );
}
