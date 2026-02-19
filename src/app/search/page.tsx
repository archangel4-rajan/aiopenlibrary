"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import PromptCard from "@/components/PromptCard";
import SkeletonCard from "@/components/SkeletonCard";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/AuthProvider";
import { Suspense } from "react";

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialDifficulty = searchParams.get("difficulty") || "";
  const initialModel = searchParams.get("model") || "";

  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [difficultyFilter, setDifficultyFilter] = useState(initialDifficulty);
  const [modelFilter, setModelFilter] = useState(initialModel);
  const [results, setResults] = useState<DbPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [showFilters, setShowFilters] = useState(
    !!(initialCategory || initialDifficulty || initialModel)
  );
  const { user } = useAuth();
  const isFirstLoad = useRef(true);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch categories for filter dropdown
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  // Fetch saved IDs when user is available
  useEffect(() => {
    if (user) {
      fetch("/api/user/saved-ids")
        .then((res) => res.json())
        .then((ids) => setSavedIds(ids))
        .catch(() => {});
    }
  }, [user]);

  const fetchResults = useCallback(
    async (q: string, cat: string, diff: string, mod: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (cat) params.set("category", cat);
        if (diff) params.set("difficulty", diff);
        if (mod) params.set("model", mod);

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Search on debounced query or filter change
  useEffect(() => {
    fetchResults(debouncedQuery, categoryFilter, difficultyFilter, modelFilter);
  }, [debouncedQuery, categoryFilter, difficultyFilter, modelFilter, fetchResults]);

  // Sync filters to URL (skip first render)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (categoryFilter) params.set("category", categoryFilter);
    if (difficultyFilter) params.set("difficulty", difficultyFilter);
    if (modelFilter) params.set("model", modelFilter);
    const paramString = params.toString();
    router.replace(`/search${paramString ? `?${paramString}` : ""}`, {
      scroll: false,
    });
  }, [debouncedQuery, categoryFilter, difficultyFilter, modelFilter, router]);

  // Sync from URL params (e.g. when clicking a TagLink).
  // `query` is intentionally excluded — including it causes an infinite loop
  // because setQuery updates query which would re-trigger this effect.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const hasActiveFilters = !!(categoryFilter || difficultyFilter || modelFilter);

  const clearAllFilters = () => {
    setCategoryFilter("");
    setDifficultyFilter("");
    setModelFilter("");
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Search" },
            ]}
          />
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Search Prompts
          </h1>

          {/* Search input */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                placeholder="Search by title, category, or tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-4 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-500 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-stone-400 dark:border-stone-500 bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                  : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 dark:bg-white text-[10px] font-bold text-white dark:text-stone-900">
                  {[categoryFilter, difficultyFilter, modelFilter].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4">
              {/* Category dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Difficulty chips */}
              <div className="flex gap-1.5">
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <button
                    key={diff}
                    onClick={() =>
                      setDifficultyFilter(difficultyFilter === diff ? "" : diff)
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficultyFilter === diff
                        ? diff === "Beginner"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : diff === "Intermediate"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Model dropdown */}
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none"
              >
                <option value="">All Models</option>
                <option value="GPT-4o">GPT-4o</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                <option value="Claude 3.5 Haiku">Claude 3.5 Haiku</option>
                <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
                <option value="Any Model">Any Model</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="mt-3 text-sm text-stone-400 dark:text-stone-500">
            {isLoading
              ? "Searching..."
              : `${results.length} prompt${results.length !== 1 ? "s" : ""} ${
                  query.trim() ? `matching "${query}"` : "found"
                }`}
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((prompt) => (
              <PromptCard
                key={prompt.slug}
                prompt={prompt}
                isSaved={savedIds.includes(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
            <p className="mt-3 text-stone-400 dark:text-stone-500">
              {query.trim() || hasActiveFilters
                ? "No prompts matched your search — try different keywords or adjust your filters."
                : "Type a keyword to find the right prompt."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-stone-400 dark:text-stone-500">Loading...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
