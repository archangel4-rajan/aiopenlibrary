"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import type { DbPrompt, DbCategory, DbChain, DbChainStep } from "@/lib/types";

interface StepFormData {
  prompt_id: string;
  title_override: string;
  input_instructions: string;
  context_note: string;
  estimated_minutes: string;
}

interface ChainFormProps {
  chain?: DbChain;
  steps?: DbChainStep[];
  creatorPrompts: DbPrompt[];
  categories: DbCategory[];
  backUrl?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ChainForm({
  chain,
  steps: existingSteps,
  creatorPrompts,
  categories,
  backUrl = "/creator",
}: ChainFormProps) {
  const router = useRouter();
  const isEdit = !!chain;

  const [title, setTitle] = useState(chain?.title ?? "");
  const [slug, setSlug] = useState(chain?.slug ?? "");
  const [description, setDescription] = useState(chain?.description ?? "");
  const [categoryId, setCategoryId] = useState(chain?.category_id ?? "");
  const [difficulty, setDifficulty] = useState<string>(chain?.difficulty ?? "Intermediate");
  const [tags, setTags] = useState(chain?.tags?.join(", ") ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(chain?.estimated_minutes?.toString() ?? "");
  const [useCases, setUseCases] = useState(chain?.use_cases?.join("\n") ?? "");
  const [isPremium, setIsPremium] = useState(chain?.is_premium ?? false);
  const [zapPrice, setZapPrice] = useState(chain?.zap_price?.toString() ?? "");
  const [isPublished, setIsPublished] = useState(chain?.is_published ?? true);

  const [formSteps, setFormSteps] = useState<StepFormData[]>(() => {
    if (existingSteps && existingSteps.length > 0) {
      return existingSteps.map((s) => ({
        prompt_id: s.prompt_id,
        title_override: s.title_override ?? "",
        input_instructions: s.input_instructions ?? "",
        context_note: s.context_note ?? "",
        estimated_minutes: s.estimated_minutes?.toString() ?? "",
      }));
    }
    return [{ prompt_id: "", title_override: "", input_instructions: "", context_note: "", estimated_minutes: "" }];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const addStep = () => {
    setFormSteps([...formSteps, { prompt_id: "", title_override: "", input_instructions: "", context_note: "", estimated_minutes: "" }]);
  };

  const removeStep = (index: number) => {
    if (formSteps.length <= 1) return;
    setFormSteps(formSteps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof StepFormData, value: string) => {
    const updated = [...formSteps];
    updated[index] = { ...updated[index], [field]: value };
    setFormSteps(updated);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= formSteps.length) return;
    const updated = [...formSteps];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setFormSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedUseCases = useCases
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const body = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      category_name: selectedCategory?.name || null,
      category_slug: selectedCategory?.slug || null,
      tags: parsedTags,
      difficulty,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
      use_cases: parsedUseCases,
      is_premium: isPremium,
      zap_price: isPremium && zapPrice ? parseInt(zapPrice, 10) : null,
      is_published: isPublished,
      steps: formSteps.map((s, i) => ({
        prompt_id: s.prompt_id,
        step_number: i + 1,
        title_override: s.title_override || null,
        input_instructions: s.input_instructions || null,
        context_note: s.context_note || null,
        estimated_minutes: s.estimated_minutes ? parseInt(s.estimated_minutes, 10) : null,
      })),
    };

    try {
      const url = isEdit ? `/api/creator/chains/${chain!.id}` : "/api/creator/chains";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to ${isEdit ? "update" : "create"} chain`);
      }

      router.push("/creator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-stone-900 dark:text-stone-100">
        {isEdit ? "Edit Chain" : "Create Chain"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="My Prompt Chain"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Slug *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="my-prompt-chain"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-mono text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
            required
          />
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            URL: /chains/{slug || "..."}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this chain does and what users will accomplish..."
            rows={3}
            className="w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
            required
          />
        </div>

        {/* Category + Difficulty row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-600 dark:focus:ring-stone-700"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-600 dark:focus:ring-stone-700"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="workflow, automation, multi-step"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
          />
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Comma-separated</p>
        </div>

        {/* Estimated minutes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Estimated Minutes
          </label>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="15"
            min="1"
            className="w-32 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
          />
        </div>

        {/* Use Cases */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Use Cases
          </label>
          <textarea
            value={useCases}
            onChange={(e) => setUseCases(e.target.value)}
            placeholder="One per line..."
            rows={3}
            className="w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
          />
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">One per line</p>
        </div>

        {/* Premium toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            Premium Chain
          </label>

          {isPremium && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500 dark:text-stone-400">⚡</span>
              <input
                type="number"
                value={zapPrice}
                onChange={(e) => setZapPrice(e.target.value)}
                placeholder="Price"
                min="1"
                className="w-24 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
              />
              <span className="text-sm text-stone-500 dark:text-stone-400">Zaps</span>
            </div>
          )}
        </div>

        {/* Published toggle */}
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
          />
          Published
        </label>

        {/* Steps section */}
        <div className="border-t border-stone-200 pt-6 dark:border-stone-700">
          <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Steps
          </h2>

          <div className="space-y-4">
            {formSteps.map((step, index) => (
              <div
                key={index}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                      className="rounded p-1 text-stone-400 hover:bg-stone-200 disabled:opacity-30 dark:text-stone-500 dark:hover:bg-stone-700"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === formSteps.length - 1}
                      className="rounded p-1 text-stone-400 hover:bg-stone-200 disabled:opacity-30 dark:text-stone-500 dark:hover:bg-stone-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {formSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500 dark:text-stone-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Prompt selector */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Prompt *
                  </label>
                  <select
                    value={step.prompt_id}
                    onChange={(e) => updateStep(index, "prompt_id", e.target.value)}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-600 dark:focus:ring-stone-700"
                  >
                    <option value="">Select a prompt...</option>
                    {creatorPrompts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title override */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Title Override
                  </label>
                  <input
                    type="text"
                    value={step.title_override}
                    onChange={(e) => updateStep(index, "title_override", e.target.value)}
                    placeholder="Optional: override prompt title for this step"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
                  />
                </div>

                {/* Input instructions */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Input Instructions
                  </label>
                  <textarea
                    value={step.input_instructions}
                    onChange={(e) => updateStep(index, "input_instructions", e.target.value)}
                    placeholder="What should users paste or prepare from previous steps?"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
                  />
                </div>

                {/* Context note */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Context Note
                  </label>
                  <textarea
                    value={step.context_note}
                    onChange={(e) => updateStep(index, "context_note", e.target.value)}
                    placeholder="Any additional context or tips for this step"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
                  />
                </div>

                {/* Step estimated minutes */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Estimated Minutes
                  </label>
                  <input
                    type="number"
                    value={step.estimated_minutes}
                    onChange={(e) => updateStep(index, "estimated_minutes", e.target.value)}
                    placeholder="5"
                    min="1"
                    className="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 border-t border-stone-200 pt-6 dark:border-stone-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Chain"
                : "Create Chain"}
          </button>
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
