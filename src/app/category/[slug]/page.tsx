import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getPromptsByCategory,
  getUserSavedPromptIds,
  getUserPurchasedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";
import Breadcrumb from "@/components/Breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const title = `${category.name} AI Prompts — Free Templates & Examples`;
  const description = category.description || `Browse curated ${category.name} AI prompts. Ready-to-use templates for ChatGPT, Claude, and more.`;
  const url = `https://aiopenlibrary.com/category/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "AIOpenLibrary",
    },
    twitter: { card: "summary", title, description },
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

  const [savedIds, purchasedPromptIds] = await Promise.all([
    user ? getUserSavedPromptIds(user.id) : Promise.resolve([]),
    user ? getUserPurchasedPromptIds(user.id) : Promise.resolve([]),
  ]);

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI Prompts`,
    description: category.description,
    url: `https://aiopenlibrary.com/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryPrompts.length,
      itemListElement: categoryPrompts.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `https://aiopenlibrary.com/prompts/${p.slug}`,
      })),
    },
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
          />
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                {category.name}
              </h1>
              <p className="mt-1 text-base text-stone-500 dark:text-stone-300">
                {category.description}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">
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
                isPurchased={purchasedPromptIds.includes(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 p-12 text-center">
            <p className="text-stone-400 dark:text-stone-500">
              No prompts in this category yet. Be the first to contribute!
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex rounded-lg bg-stone-900 dark:bg-stone-50 px-4 py-2 text-sm font-medium text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100"
            >
              Submit a Prompt
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
