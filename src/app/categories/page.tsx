import Link from "next/link";
import { BookOpen, Link2, Sparkles } from "lucide-react";
import { getCategories, getCategoryPromptCounts, getPublishedChains } from "@/lib/db";
import CategoryCard from "@/components/CategoryCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse AI Prompts, Chains & Skills — AIOpenLibrary",
  alternates: { canonical: "https://aiopenlibrary.com/categories" },
  description:
    "Find the right AI prompt for any task. Browse prompts, step-by-step chains, and skills across coding, writing, research, marketing, and more.",
};

export default async function CategoriesPage() {
  const [categories, promptCounts, chains] = await Promise.all([
    getCategories(),
    getCategoryPromptCounts(),
    getPublishedChains(),
  ]);

  const totalPrompts = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
            Browse
          </h1>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-300">
            Prompts, chains, and skills — everything you need to get more from AI.
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/categories"
            className="flex items-center gap-3 rounded-lg border-2 border-stone-900 bg-white p-4 dark:border-stone-100 dark:bg-stone-900"
          >
            <BookOpen className="h-5 w-5 text-stone-700 dark:text-stone-300" />
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Prompts</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{totalPrompts} available</p>
            </div>
          </Link>
          <Link
            href="/chains"
            className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
          >
            <Link2 className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Prompt Chains</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{chains.length} available</p>
            </div>
          </Link>
          <div
            className="flex items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 dark:border-stone-600 dark:bg-stone-900/50"
          >
            <Sparkles className="h-5 w-5 text-stone-400 dark:text-stone-500" />
            <div>
              <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">Skills</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Prompt Categories */}
        <h2 className="mb-6 text-lg font-semibold text-stone-900 dark:text-stone-100">
          Prompt Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.slug} className="flex flex-col">
              <CategoryCard
                category={{
                  ...category,
                  promptCount: promptCounts[category.slug] || 0,
                }}
              />
              <p className="mt-2 px-1 text-xs text-stone-400 dark:text-stone-500">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
