"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Check } from "lucide-react";
import type { DbPrompt, PromptPack } from "@/lib/types";

interface PackFormProps {
  pack?: PromptPack & { prompt_ids?: string[] };
  creatorPrompts: DbPrompt[];
}

export default function PackForm({ pack, creatorPrompts }: PackFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(pack?.name || "");
  const [slug, setSlug] = useState(pack?.slug || "");
  const [description, setDescription] = useState(pack?.description || "");
  const [zapPrice, setZapPrice] = useState(pack?.zap_price ?? 10);
  const [isPublished, setIsPublished] = useState(pack?.is_published ?? true);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>(
    pack?.prompt_ids || []
  );

  const mode = pack ? "edit" : "create";

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === "create") {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [name, mode]);

  const togglePrompt = (promptId: string) => {
    setSelectedPromptIds((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const body = {
      name,
      slug,
      description,
      zap_price: zapPrice,
      is_published: isPublished,
      prompt_ids: selectedPromptIds,
    };

    try {
      const url = mode === "create" ? "/api/packs" : `/api/packs/${pack!.id}`;
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

      router.push("/creator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700";
  const labelClass = "block text-sm font-medium text-stone-700 dark:text-stone-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Pack Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={200}
            className={inputClass}
            placeholder="My Awesome Pack"
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-sm text-stone-600 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:focus:border-stone-500 dark:focus:ring-stone-700"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
          className={inputClass}
          placeholder="Describe what makes this pack valuable..."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Price in Zaps *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">⚡</span>
            <input
              type="number"
              value={zapPrice}
              onChange={(e) => setZapPrice(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              required
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-8 pr-4 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
            />
          </div>
        </div>
        <div className="flex items-end">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-stone-50 after:transition-all after:content-[''] peer-checked:bg-stone-700 peer-checked:after:translate-x-full dark:bg-stone-600 dark:after:bg-stone-300 dark:peer-checked:bg-stone-400" />
            </label>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Prompt Selector */}
      <div>
        <label className={labelClass}>
          Select Prompts * ({selectedPromptIds.length} selected)
        </label>
        <div className="mt-2 max-h-80 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3 dark:border-stone-700">
          {creatorPrompts.length === 0 ? (
            <p className="py-4 text-center text-sm text-stone-400 dark:text-stone-500">
              No prompts available. Create prompts first.
            </p>
          ) : (
            creatorPrompts.map((prompt) => {
              const isSelected = selectedPromptIds.includes(prompt.id);
              return (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => togglePrompt(prompt.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
                      : "border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-stone-300 dark:border-stone-600"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                      {prompt.title}
                    </p>
                    <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                      {prompt.category_name}
                      {prompt.zap_price ? ` · ⚡ ${prompt.zap_price}` : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || selectedPromptIds.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Pack"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/creator")}
          className="rounded-lg border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
