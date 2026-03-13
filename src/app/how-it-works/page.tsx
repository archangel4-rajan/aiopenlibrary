import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — AIOpenLibrary",
  description:
    "Discover how AIOpenLibrary works in 3 simple steps: browse and discover prompts, customize variables, and get AI-powered results.",
  alternates: { canonical: "https://aiopenlibrary.com/how-it-works" },
};

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Discover",
    description:
      "Explore 113+ expert-crafted prompts across 20 categories — from coding and writing to marketing, education, and beyond. Use search, filters, and categories to find exactly what you need.",
    details: [
      "Search by keyword, category, or tag",
      "Filter by difficulty level and recommended model",
      "Save favorites to your personal library",
      "Discover prompts tailored to your workflow",
    ],
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Customize Variables",
    description:
      "Every prompt includes customizable variables wrapped in {{double_braces}}. Fill in your specific details — topic, audience, tone, constraints — and the prompt adapts to your exact use case.",
    details: [
      "Variables are highlighted and easy to spot",
      "Fill in as many or as few as you need",
      "Copy the customized prompt with one click",
      "Reuse the same prompt template with different inputs",
    ],
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Results",
    description:
      "Paste your customized prompt into any AI model — ChatGPT, Claude, Gemini, or others. Because the prompt is well-structured and specific, you'll get dramatically better results than winging it.",
    details: [
      "Works with any text-based AI model",
      "Recommended models noted on each prompt",
      "Iterate and refine for even better output",
      "Share your best prompts back with the community",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 sm:text-5xl">
            How It Works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 dark:text-stone-300">
            Get better AI results in three simple steps. No expertise required.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 space-y-12">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-900"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute -bottom-12 left-1/2 hidden h-12 w-px bg-stone-200 dark:bg-stone-700 sm:block" />
              )}

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Icon + Number */}
                <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Step {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-stone-600 dark:text-stone-300">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-sm text-stone-500 dark:text-stone-400"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Ready to get started?
          </h2>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
            Browse the library and find your first prompt in seconds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
            >
              Browse Prompts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Share a Prompt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
