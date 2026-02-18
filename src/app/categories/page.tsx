import { getCategories, getCategoryPromptCounts } from "@/lib/db";
import CategoryCard from "@/components/CategoryCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories - AIOpenLibrary",
  description:
    "Browse AI prompts by category. Software engineering, writing, data science, marketing, design, and more.",
};

export default async function CategoriesPage() {
  const [categories, promptCounts] = await Promise.all([
    getCategories(),
    getCategoryPromptCounts(),
  ]);

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            All Categories
          </h1>
          <p className="mt-3 text-base text-stone-500">
            Browse our curated library of AI prompts organized by category.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.slug} className="flex flex-col">
              <CategoryCard
                category={{
                  ...category,
                  promptCount: promptCounts[category.slug] || 0,
                }}
              />
              <p className="mt-2 px-1 text-xs text-stone-400">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
