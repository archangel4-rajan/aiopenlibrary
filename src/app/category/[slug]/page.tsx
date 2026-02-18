import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getCategoryBySlug,
  getPromptsByCategory,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Prompts - AIOpenLibrary`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categoryPrompts, user] = await Promise.all([
    getCategoryBySlug(slug),
    getPromptsByCategory(slug),
    getUser(),
  ]);

  if (!category) {
    notFound();
  }

  const savedIds = user ? await getUserSavedPromptIds(user.id) : [];

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/categories"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">
                {category.name}
              </h1>
              <p className="mt-1 text-base text-stone-500">
                {category.description}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-400">
            {categoryPrompts.length} prompt
            {categoryPrompts.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {categoryPrompts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryPrompts.map((prompt) => (
              <PromptCard
                key={prompt.slug}
                prompt={prompt}
                isSaved={savedIds.includes(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-stone-200 p-12 text-center">
            <p className="text-stone-400">
              No prompts in this category yet. Be the first to contribute!
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              Submit a Prompt
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
