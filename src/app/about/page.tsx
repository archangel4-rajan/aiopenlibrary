import Link from "next/link";
import { ArrowRight, BookOpen, Users, Globe, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - AIOpenLibrary",
  description: "AIOpenLibrary is the open library for prompts. Learn about our mission to make AI accessible to everyone.",
};

export default function AboutPage() {
  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stone-900 sm:text-5xl">
            Prompting is <span className="gradient-text">not trivial</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500">
            AIOpenLibrary is the open library for prompts. We believe that the
            ability to communicate effectively with AI is one of the most
            important skills of the 21st century.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Open Knowledge
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Like Wikipedia, we believe knowledge should be free and accessible.
              Every prompt in our library is open for everyone to use, learn
              from, and improve.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Community Driven
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Our library grows through community contributions. Expert
              practitioners share their best prompts so everyone can benefit
              from collective knowledge.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Learn by Doing
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Every prompt comes with variables, use cases, and tips. Don&apos;t
              just copy-paste — understand why prompts work and learn to craft
              your own.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Model Agnostic
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              We recommend the best model for each prompt, but our prompts work
              across ChatGPT, Claude, Gemini, and other AI tools. Use whatever
              works best for you.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-stone-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Really upskill with AI
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-stone-400">
            Whether you&apos;re a developer, writer, marketer, or researcher —
            there&apos;s a prompt that can 10x your productivity.
          </p>
          <Link
            href="/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-stone-900 hover:bg-stone-100"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
