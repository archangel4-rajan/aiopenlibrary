"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is AIOpenLibrary?",
    a: "AIOpenLibrary is a free library of expert-crafted AI prompts. Think of it as the Wikipedia for prompts — a community-curated collection of ready-to-use templates for ChatGPT, Claude, Gemini, and other AI models. Browse by category, customize variables, and get better results from any AI.",
  },
  {
    q: "Is AIOpenLibrary free to use?",
    a: "Yes! The vast majority of prompts are completely free. You can browse, copy, and use them without even creating an account. Some premium prompts require Zaps (our in-app currency), but the core library is and always will be free.",
  },
  {
    q: "How do I submit a prompt?",
    a: 'Click "Share a Prompt" in the navigation or visit the submit page. You\'ll walk through a 3-step wizard: add basic info, write your prompt (with {{variable}} placeholders), and review before submitting. All submissions are reviewed by our team before being published.',
  },
  {
    q: "What are Zaps?",
    a: "Zaps are AIOpenLibrary's in-app currency used to unlock premium prompts and prompt packs. Every new account gets 100 free Zaps as a welcome bonus. You can purchase more Zaps or earn them by becoming a creator and having your prompts used by others.",
  },
  {
    q: "What are Prompt Chains?",
    a: "Prompt chains are sequences of connected prompts designed to tackle complex tasks step-by-step. Instead of one massive prompt, a chain breaks the work into focused stages — each step's output feeds into the next. This produces higher-quality results for tasks like research, content creation, and analysis.",
  },
  {
    q: "How do I become a Creator?",
    a: "Creators are community members who regularly contribute high-quality prompts. Once you've had several submissions approved, you can apply for creator status from your profile page. Creators get a public profile, analytics on their prompts, and earn Zaps when others use their premium content.",
  },
  {
    q: "What makes a good prompt submission?",
    a: "Great submissions have a clear title and description, use {{variable_name}} syntax for customizable parts, specify which AI model works best, and have been tested thoroughly. Check our Prompt Writing Guide for detailed tips on writing effective prompts.",
  },
  {
    q: "Which AI models are supported?",
    a: "AIOpenLibrary prompts work with any text-based AI model. We tag prompts with recommended models (Claude, GPT-4o, Gemini, etc.) based on where they perform best, but most prompts work well across all major models. The key is the prompt structure, not the specific model.",
  },
  {
    q: "Can I save and organize prompts?",
    a: "Yes! Create a free account to unlock your personal library. Bookmark any prompt to save it, organize prompts into custom collections, and access your saved prompts from any device. Your library and collections sync automatically.",
  },
  {
    q: "How long does the review process take?",
    a: "Most submissions are reviewed within a few days. We check for quality, accuracy, and originality. You can track your submission status from the My Submissions tab on your profile page. You'll be notified when your prompt is approved and published.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-stone-200 dark:border-stone-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-medium text-stone-900 dark:text-stone-100">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 dark:text-stone-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-stone-900 dark:text-stone-100 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500 dark:text-stone-300">
            Everything you need to know about AIOpenLibrary.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-12 divide-y-0 rounded-lg border border-stone-200 bg-white px-6 dark:border-stone-700 dark:bg-stone-900">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Still have questions?{" "}
            <Link
              href="/about"
              className="font-medium text-stone-900 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300"
            >
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
