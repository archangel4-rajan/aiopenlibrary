"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import PromptCard from "./PromptCard";

interface LibraryFilterProps {
  prompts: DbPrompt[];
  savedIds: string[];
}

export default function LibraryFilter({ prompts, savedIds }: LibraryFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    for (const p of prompts) {
      cats.set(p.category_slug, p.category_name);
    }
    return Array.from(cats.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [prompts]);

  const filtered = useMemo(() => {
    let result = prompts;

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_slug === selectedCategory);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [prompts, query, selectedCategory]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search your library..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-700"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-500 dark:focus:ring-stone-700"
        >
          <option value="all">All Categories</option>
          {categories.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      {(query.trim() || selectedCategory !== "all") && (
        <p className="mb-4 text-sm text-stone-400">
          {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
          {query.trim() ? ` matching "${query}"` : ""}
          {selectedCategory !== "all"
            ? ` in ${categories.find(([s]) => s === selectedCategory)?.[1]}`
            : ""}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <PromptCard
              key={prompt.slug}
              prompt={prompt}
              isSaved={savedIds.includes(prompt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-8 text-center dark:border-stone-700">
          <p className="text-sm text-stone-400">
            No prompts match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
