import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Lightbulb,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  getCategories,
  getFeaturedPrompts,
  getRecentPrompts,
  getPromptsCount,
  getCategoryPromptCounts,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";
import CategoryCard from "@/components/CategoryCard";

export default async function Home() {
  const [categoriesData, featured, recentPrompts, promptsCount, user] = await Promise.all([
    getCategories(),
    getFeaturedPrompts(),
    getRecentPrompts(6),
    getPromptsCount(),
    getUser(),
  ]);

  const [promptCounts, savedIds] = await Promise.all([
    getCategoryPromptCounts(),
    user ? getUserSavedPromptIds(user.id) : Promise.resolve([]),
  ]);

  const categories = categoriesData.map((c) => ({
    ...c,
    promptCount: promptCounts[c.slug] || 0,
  }));

  return (
    <div className="bg-stone-50 dark:bg-stone-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-200 dark:border-stone-700">
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Free and open source
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-6xl lg:text-7xl">
              Get better results from{" "}
              <span className="gradient-text">every AI prompt</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:mt-6 sm:text-xl">
              Stop writing prompts from scratch. Browse {promptsCount}+ expert-crafted,
              ready-to-use prompts across {categories.length} categories — customize the
              variables and copy.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 dark:bg-white px-6 py-3 text-sm font-medium text-white dark:text-stone-900 transition-all hover:bg-stone-800 dark:hover:bg-stone-100"
              >
                Start Exploring
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-6 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 transition-all hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700"
              >
                Share a Prompt
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-10 flex max-w-lg justify-center gap-6 sm:mt-16 sm:gap-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                  {promptsCount}+
                </div>
                <div className="mt-1 text-sm text-stone-400 dark:text-stone-500">Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                  {categories.length}
                </div>
                <div className="mt-1 text-sm text-stone-400 dark:text-stone-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                  Weekly
                </div>
                <div className="mt-1 text-sm text-stone-400 dark:text-stone-500">Updated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
              How it works
            </h2>
            <p className="mt-2 text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
              From browse to brilliant in 3 steps
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-8">
            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400 dark:text-stone-500">
                01
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900 dark:text-stone-100">
                Find Your Prompt
              </h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Browse {categories.length} categories — from coding and writing
                to research, marketing, and beyond.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                <Copy className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400 dark:text-stone-500">
                02
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900 dark:text-stone-100">
                Make It Yours
              </h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Fill in the variables, tweak the wording, and tailor every
                prompt to your exact situation.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                <Zap className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400 dark:text-stone-500">
                03
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900 dark:text-stone-100">
                Get Better Output
              </h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Paste into ChatGPT, Claude, Gemini, or any AI — and see the
                difference a great prompt makes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-stone-200 dark:border-stone-700 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Categories
              </h2>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                Prompts for every skill
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug}
                category={{
                  name: category.name,
                  slug: category.slug,
                  icon: category.icon,
                  description: category.description,
                  promptCount: category.promptCount,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Prompts */}
      <section className="border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Featured Prompts
                </h2>
                <TrendingUp className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                Community favorites
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 sm:flex"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((prompt) => (
              <PromptCard
                key={prompt.slug}
                prompt={prompt}
                isSaved={savedIds.includes(prompt.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      {recentPrompts.length > 0 && (
        <section className="border-b border-stone-200 dark:border-stone-700 py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Recently Added
                  </h2>
                  <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                  Fresh from the community
                </p>
              </div>
              <Link
                href="/categories"
                className="hidden items-center gap-1 text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 sm:flex"
              >
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.slug}
                  prompt={prompt}
                  isSaved={savedIds.includes(prompt.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-stone-900 px-6 py-12 text-center sm:px-16 sm:py-16">
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-4xl">
                Built a prompt that works?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-stone-400">
                Share it with thousands of people looking for exactly that.
                Every contribution makes the library better for everyone.
              </p>
              <Link
                href="/submit"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-all hover:bg-stone-100"
              >
                Share Your Prompt
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
