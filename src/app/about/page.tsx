import Link from "next/link";
import { ArrowRight, BookOpen, Users, Globe, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - AIOpenLibrary",
  description: "We're building the world's largest open collection of AI prompts. Learn why good prompting matters and how you can contribute.",
};

export default function AboutPage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 sm:text-5xl">
            Prompting is <span className="gradient-text">not trivial</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 dark:text-stone-400">
            The difference between a mediocre AI response and a great one usually
            comes down to the prompt. We&apos;re building the open resource that
            helps everyone write better ones.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Open Knowledge
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Every prompt in our library is free to use, learn from, and
              improve — no paywalls, no sign-up walls, no strings attached.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Community Driven
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              The best prompts come from practitioners who use AI daily.
              Contributors share what actually works so everyone levels up
              together.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Learn by Doing
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Every prompt includes variables, use cases, and tips so you
              understand why it works — not just how to paste it.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Model Agnostic
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Each prompt includes a recommended model, but they all work across
              ChatGPT, Claude, Gemini, and more. Use whatever you prefer.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-stone-900 p-8 text-center dark:bg-stone-800 sm:p-12">
          <h2 className="text-2xl font-bold text-white dark:text-stone-100 sm:text-3xl">
            Ready to get more from AI?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-stone-400 dark:text-stone-500">
            Whether you code, write, research, or market — there&apos;s a prompt
            here that will save you hours.
          </p>
          <Link
            href="/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-stone-900 hover:bg-stone-100 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
