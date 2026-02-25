"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, LogIn, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { DbCategory } from "@/lib/types";

type SubmitState = "idle" | "submitting" | "success" | "error";
type WizardStep = 1 | 2 | 3;

const MODEL_OPTIONS = [
  "Claude Opus 4",
  "Claude Sonnet 4",
  "Claude Sonnet 4.5",
  "Claude Haiku 3.5",
  "GPT-4o",
  "Grok 4.20",
  "Gemini 2.5 Pro",
  "o3",
  "Llama 3.3",
  "Any Model",
];

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function SubmitPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [stepError, setStepError] = useState("");

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Prompt Details
  const [prompt, setPrompt] = useState("");
  const [recommendedModel, setRecommendedModel] = useState("");
  const [modelIcon, setModelIcon] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTY_LEVELS[number]>("Beginner");

  // Step 3: Review & Submit
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const validateStep1 = (): boolean => {
    setStepError("");
    if (!title.trim()) {
      setStepError("Title is required");
      return false;
    }
    if (!categoryId) {
      setStepError("Category is required");
      return false;
    }
    if (!description.trim()) {
      setStepError("Description is required");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setStepError("");
    if (!prompt.trim()) {
      setStepError("Prompt text is required");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
      setStepError("");
    }
  };

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

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl dark:text-stone-100">
              Sign in to share a prompt
            </h1>
            <p className="mt-3 text-base text-stone-500 dark:text-stone-300">
              Create a free account to contribute your best prompts to the
              community.
            </p>
            <Link
              href="/auth/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl dark:text-stone-100">
              Thanks for sharing!
            </h1>
            <p className="mt-3 text-base text-stone-500 dark:text-stone-300">
              Your prompt is in the review queue. We&apos;ll publish it once
              it&apos;s been checked — usually within a few days.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setState("idle");
                  setCurrentStep(1);
                  setTitle("");
                  setCategoryId("");
                  setDescription("");
                  setPrompt("");
                  setRecommendedModel("");
                  setModelIcon("");
                  setTagsStr("");
                  setDifficulty("Beginner");
                  setEmail("");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
              >
                Submit Another
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
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
    "mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-700";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
            <Send className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-stone-900 sm:text-4xl dark:text-stone-100">
            Share a Prompt
          </h1>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
            Found a prompt that gets great results? Share it here and help
            thousands of people work better with AI.
          </p>
        </div>

        {/* Guidelines Box */}
        <div className="mt-10 rounded-lg border border-stone-200 bg-stone-50 p-6 sm:p-8 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
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
                className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300"
              >
                <span className="mt-0.5 shrink-0 text-stone-400 dark:text-stone-500">
                  &#8226;
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Indicator */}
        <div className="mt-10 flex justify-center">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    currentStep >= step
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-colors ${
                      currentStep > step
                        ? "bg-stone-900 dark:bg-stone-100"
                        : "bg-stone-200 dark:bg-stone-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-center text-sm text-stone-600 dark:text-stone-400">
          Step {currentStep} of 3
        </div>

        {/* Error Message */}
        {(stepError || error) && (
          <div
            className={`mt-6 rounded-lg border p-3 text-sm ${
              stepError
                ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400"
                : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {stepError || error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <form className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Prompt Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Developer Code Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Category *
              </label>
              <select
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
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Description *
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of what this prompt does and when to use it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Prompt Details */}
        {currentStep === 2 && (
          <form className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Prompt Text *
              </label>
              <textarea
                rows={10}
                placeholder="Enter your full prompt here. Use {{variable_name}} for customizable parts..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`${inputClass} font-mono text-xs`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Recommended Model
              </label>
              <select
                value={recommendedModel}
                onChange={(e) => {
                  setRecommendedModel(e.target.value);
                  if (e.target.value.includes("Claude")) {
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
                {MODEL_OPTIONS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
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
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Difficulty Level
              </label>
              <div className="mt-3 space-y-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 cursor-pointer transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) =>
                        setDifficulty(e.target.value as typeof DIFFICULTY_LEVELS[number])
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-lg border border-stone-300 bg-stone-50 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
              >
                Review
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Review Box */}
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Review Your Submission
              </h3>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Title
                  </p>
                  <p className="mt-1 text-base font-medium text-stone-900 dark:text-stone-100">
                    {title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Category
                  </p>
                  <p className="mt-1 text-base text-stone-700 dark:text-stone-300">
                    {selectedCategory?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Description
                  </p>
                  <p className="mt-1 text-base text-stone-700 dark:text-stone-300">
                    {description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Prompt
                  </p>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                    {prompt}
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Recommended Model
                  </p>
                  <p className="mt-1 text-base text-stone-700 dark:text-stone-300">
                    {recommendedModel || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Difficulty Level
                  </p>
                  <p className="mt-1 text-base text-stone-700 dark:text-stone-300">
                    {difficulty}
                  </p>
                </div>

                {tagsStr && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Tags
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagsStr
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email for Attribution */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
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

            {/* Navigation & Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-lg border border-stone-300 bg-stone-50 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={state === "submitting"}
                className="flex-1 rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50 dark:disabled:opacity-50"
              >
                {state === "submitting" ? "Submitting..." : "Submit Prompt for Review"}
              </button>
            </div>

            <p className="text-center text-xs text-stone-400 dark:text-stone-500">
              All submissions are reviewed before publishing. We&apos;ll let you
              know when yours goes live.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
