import { Send } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Prompt - AIOpenLibrary",
  description: "Share your best AI prompts with the community.",
};

export default function SubmitPage() {
  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
            <Send className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl">
            Submit a Prompt
          </h1>
          <p className="mt-3 text-base text-stone-500">
            Share your expertly crafted prompts with the community and help
            others upskill with AI.
          </p>
        </div>

        <div className="mt-10 rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">
            Submission Guidelines
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              "Include a clear title and description of what the prompt does",
              "Add variables using {{variable_name}} syntax for customizable parts",
              "Specify which AI model works best with your prompt",
              "Include example use cases and any tips for best results",
              "Test your prompt thoroughly before submitting",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-stone-600"
              >
                <span className="mt-0.5 shrink-0 text-stone-400">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Prompt Title
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Developer Code Review"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Category
            </label>
            <select className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200">
              <option value="">Select a category</option>
              <option>Software Engineering</option>
              <option>Writing & Content</option>
              <option>Data Science & Analysis</option>
              <option>Marketing</option>
              <option>Design & UX</option>
              <option>Education</option>
              <option>Product Management</option>
              <option>Research</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of what this prompt does and when to use it..."
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Prompt
            </label>
            <textarea
              rows={10}
              placeholder="Enter your full prompt here. Use {{variable_name}} for customizable parts..."
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-mono text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Recommended AI Model
            </label>
            <select className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200">
              <option value="">Select a model</option>
              <option>Claude Opus 4</option>
              <option>Claude Sonnet 4</option>
              <option>Claude Haiku 3.5</option>
              <option>GPT-4o</option>
              <option>GPT-4o mini</option>
              <option>Gemini 2.5 Pro</option>
              <option>Gemini 2.0 Flash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., code-review, debugging, best-practices"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Your Email (optional)
            </label>
            <input
              type="email"
              placeholder="For attribution and updates"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Submit Prompt for Review
          </button>
          <p className="text-center text-xs text-stone-400">
            Submitted prompts are reviewed before being published. We&apos;ll
            notify you once your prompt is live.
          </p>
        </form>
      </div>
    </div>
  );
}
