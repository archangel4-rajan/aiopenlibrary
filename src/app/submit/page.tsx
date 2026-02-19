"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { DbCategory } from "@/lib/types";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function SubmitPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recommendedModel, setRecommendedModel] = useState("");
  const [modelIcon, setModelIcon] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          category_name: selectedCategory?.name || "",
          category_slug: selectedCategory?.slug || "",
          prompt,
          tags: tagsStr
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          recommended_model: recommendedModel,
          model_icon: modelIcon,
          submitter_email: email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (!user) {
    return (
      <div className="bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl">
              Sign in to share a prompt
            </h1>
            <p className="mt-3 text-base text-stone-500">
              Create a free account to contribute your best prompts to the
              community.
            </p>
            <Link
              href="/auth/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl">
              Thanks for sharing!
            </h1>
            <p className="mt-3 text-base text-stone-500">
              Your prompt is in the review queue. We&apos;ll publish it once
              it&apos;s been checked — usually within a few days.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setState("idle");
                  setTitle("");
                  setCategoryId("");
                  setDescription("");
                  setPrompt("");
                  setRecommendedModel("");
                  setModelIcon("");
                  setTagsStr("");
                  setEmail("");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
              >
                Submit Another
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200";

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
            <Send className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl">
            Share a Prompt
          </h1>
          <p className="mt-3 text-base text-stone-500">
            Found a prompt that gets great results? Share it here and help
            thousands of people work better with AI.
          </p>
        </div>

        <div className="mt-10 rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">
            What makes a great submission
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

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Prompt Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Senior Developer Code Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Brief description of what this prompt does and when to use it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Prompt *
            </label>
            <textarea
              required
              rows={10}
              placeholder="Enter your full prompt here. Use {{variable_name}} for customizable parts..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Recommended AI Model
            </label>
            <select
              value={recommendedModel}
              onChange={(e) => {
                setRecommendedModel(e.target.value);
                if (
                  e.target.value.includes("Claude") ||
                  e.target.value.includes("Haiku")
                ) {
                  setModelIcon("anthropic");
                } else if (e.target.value.includes("GPT")) {
                  setModelIcon("openai");
                } else if (e.target.value.includes("Gemini")) {
                  setModelIcon("google");
                } else {
                  setModelIcon("");
                }
              }}
              className={inputClass}
            >
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
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Your Email (optional, for attribution)
            </label>
            <input
              type="email"
              placeholder="For attribution and updates"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {state === "submitting"
              ? "Submitting..."
              : "Submit Prompt for Review"}
          </button>
          <p className="text-center text-xs text-stone-400">
            All submissions are reviewed before publishing. We&apos;ll let you
            know when yours goes live.
          </p>
        </form>
      </div>
    </div>
  );
}
