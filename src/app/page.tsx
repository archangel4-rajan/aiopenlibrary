import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Lightbulb,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  getCategories,
  getFeaturedPrompts,
  getPromptsCount,
  getCategoryPromptCounts,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";
import CategoryCard from "@/components/CategoryCard";

export default async function Home() {
  const [categoriesData, featured, promptsCount, user] = await Promise.all([
    getCategories(),
    getFeaturedPrompts(),
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
    <div className="bg-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-600">
              <BookOpen className="h-4 w-4" />
              The open library for prompts
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
              Explore the{" "}
              <span className="gradient-text">best prompts</span> in the
              world
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 sm:text-xl">
              Great prompting is a craft, not a guess. Browse expert-built
              prompts, customize variables in real time, and copy results
              ready for any AI model.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-stone-800"
              >
                Browse Prompts
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-all hover:border-stone-400 hover:bg-stone-50"
              >
                Submit a Prompt
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 flex max-w-lg justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  {promptsCount}+
                </div>
                <div className="mt-1 text-sm text-stone-400">Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  {categories.length}
                </div>
                <div className="mt-1 text-sm text-stone-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  Weekly
                </div>
                <div className="mt-1 text-sm text-stone-400">Updated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
              How it works
            </h2>
            <p className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
              From discovery to results in 3 steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400">
                01
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900">
                Browse Categories
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Find prompts across engineering, writing, data science,
                marketing, design, education, and research.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600">
                <Copy className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400">
                02
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900">
                Copy & Customize
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Fill in the variables directly on the page. Watch the prompt
                update in real time, then copy with one click.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-medium text-stone-400">
                03
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900">
                Get Results
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Paste into Claude, ChatGPT, Gemini, or any model. Each prompt
                is structured for consistent, high-quality output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-stone-200 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
                Categories
              </h2>
              <p className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
                Find prompts by category
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm text-stone-500 hover:text-stone-900 sm:flex"
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
      <section className="border-b border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
                  Featured Prompts
                </h2>
                <TrendingUp className="h-3.5 w-3.5 text-stone-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
                Most popular prompts
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm text-stone-500 hover:text-stone-900 sm:flex"
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

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-stone-900 px-8 py-16 text-center sm:px-16">
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Built a great prompt?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-stone-400">
                Share it with the community. Your best prompts help
                practitioners everywhere work smarter with AI.
              </p>
              <Link
                href="/submit"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-all hover:bg-stone-100"
              >
                Submit Your Prompt
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
