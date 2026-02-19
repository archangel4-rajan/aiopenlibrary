"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";
import type { DbPrompt, DbCategory } from "@/lib/types";
import { MODELS, getModelIcon } from "@/lib/models";

interface PromptFormProps {
  prompt?: DbPrompt;
  categories: DbCategory[];
  mode: "create" | "edit";
}

export default function PromptForm({
  prompt,
  categories,
  mode,
}: PromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(prompt?.title || "");
  const [slug, setSlug] = useState(prompt?.slug || "");
  const [description, setDescription] = useState(prompt?.description || "");
  const [categoryId, setCategoryId] = useState(prompt?.category_id || "");
  const [promptText, setPromptText] = useState(prompt?.prompt || "");
  const [tagsStr, setTagsStr] = useState((prompt?.tags || []).join(", "));
  const [recommendedModel, setRecommendedModel] = useState(
    prompt?.recommended_model || "Claude Sonnet 4"
  );
  const [modelIcon, setModelIcon] = useState(prompt?.model_icon || "anthropic");
  const [difficulty, setDifficulty] = useState<string>(
    prompt?.difficulty || "Intermediate"
  );
  const [isPublished, setIsPublished] = useState(
    prompt?.is_published ?? true
  );

  // Dynamic lists
  const [useCases, setUseCases] = useState<string[]>(
    prompt?.use_cases || [""]
  );
  const [variables, setVariables] = useState<
    { name: string; description: string }[]
  >((prompt?.variables as { name: string; description: string }[]) || [{ name: "", description: "" }]);
  const [tips, setTips] = useState<string[]>(prompt?.tips || [""]);
  const [references, setReferences] = useState<
    { title: string; url: string }[]
  >((prompt?.references as { title: string; url: string }[]) || []);

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === "create") {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [title, mode]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const body = {
      title,
      slug,
      description,
      category_id: categoryId,
      category_name: selectedCategory?.name || "",
      category_slug: selectedCategory?.slug || "",
      prompt: promptText,
      tags: tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      recommended_model: recommendedModel,
      model_icon: modelIcon,
      difficulty,
      is_published: isPublished,
      use_cases: useCases.filter(Boolean),
      variables: variables.filter((v) => v.name),
      tips: tips.filter(Boolean),
      references: references.filter((r) => r.title && r.url),
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/prompts"
          : `/api/admin/prompts/${prompt?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100";
  const labelClass = "block text-sm font-medium text-stone-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-sm text-stone-600 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Recommended Model</label>
          <select
            value={recommendedModel}
            onChange={(e) => {
              const selected = e.target.value;
              setRecommendedModel(selected);
              setModelIcon(getModelIcon(selected));
            }}
            className={inputClass}
          >
            {Object.values(MODELS).map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={inputClass}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Prompt Text *</label>
        <textarea
          rows={12}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 font-mono text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
          placeholder="Enter the full prompt text. Use {{variable_name}} for customizable parts..."
        />
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input
          type="text"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          className={inputClass}
          placeholder="code-review, debugging, best-practices"
        />
      </div>

      {/* Use Cases */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Use Cases
        </label>
        {useCases.map((uc, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              type="text"
              value={uc}
              onChange={(e) => {
                const newUc = [...useCases];
                newUc[i] = e.target.value;
                setUseCases(newUc);
              }}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="e.g., Pre-merge code reviews"
            />
            <button
              type="button"
              onClick={() => setUseCases(useCases.filter((_, j) => j !== i))}
              className="rounded-lg p-2 text-stone-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setUseCases([...useCases, ""])}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <Plus className="h-3 w-3" /> Add use case
        </button>
      </div>

      {/* Variables */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Variables
        </label>
        {variables.map((v, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              type="text"
              value={v.name}
              onChange={(e) => {
                const newVars = [...variables];
                newVars[i] = { ...newVars[i], name: e.target.value };
                setVariables(newVars);
              }}
              className="w-1/3 rounded-lg border border-stone-200 bg-white px-4 py-2 font-mono text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="variable_name"
            />
            <input
              type="text"
              value={v.description}
              onChange={(e) => {
                const newVars = [...variables];
                newVars[i] = { ...newVars[i], description: e.target.value };
                setVariables(newVars);
              }}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="Description"
            />
            <button
              type="button"
              onClick={() =>
                setVariables(variables.filter((_, j) => j !== i))
              }
              className="rounded-lg p-2 text-stone-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setVariables([...variables, { name: "", description: "" }])
          }
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <Plus className="h-3 w-3" /> Add variable
        </button>
      </div>

      {/* Tips */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Tips
        </label>
        {tips.map((tip, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              type="text"
              value={tip}
              onChange={(e) => {
                const newTips = [...tips];
                newTips[i] = e.target.value;
                setTips(newTips);
              }}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="A helpful tip..."
            />
            <button
              type="button"
              onClick={() => setTips(tips.filter((_, j) => j !== i))}
              className="rounded-lg p-2 text-stone-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTips([...tips, ""])}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <Plus className="h-3 w-3" /> Add tip
        </button>
      </div>

      {/* References */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          References
        </label>
        {references.map((ref, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              type="text"
              value={ref.title}
              onChange={(e) => {
                const newRefs = [...references];
                newRefs[i] = { ...newRefs[i], title: e.target.value };
                setReferences(newRefs);
              }}
              className="w-1/3 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="Reference title"
            />
            <input
              type="url"
              value={ref.url}
              onChange={(e) => {
                const newRefs = [...references];
                newRefs[i] = { ...newRefs[i], url: e.target.value };
                setReferences(newRefs);
              }}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() =>
                setReferences(references.filter((_, j) => j !== i))
              }
              className="rounded-lg p-2 text-stone-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setReferences([...references, { title: "", url: "" }])
          }
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <Plus className="h-3 w-3" /> Add reference
        </button>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-stone-700 peer-checked:after:translate-x-full" />
        </label>
        <span className="text-sm font-medium text-stone-700">
          {isPublished ? "Published (visible to everyone)" : "Draft (only visible to admins)"}
        </span>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Prompt"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
