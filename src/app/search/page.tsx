"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { DbPrompt } from "@/lib/types";
import PromptCard from "@/components/PromptCard";
import { useAuth } from "@/components/AuthProvider";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DbPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { user } = useAuth();

  // Fetch saved IDs when user is available
  useEffect(() => {
    if (user) {
      fetch("/api/user/saved-ids")
        .then((res) => res.json())
        .then((ids) => setSavedIds(ids))
        .catch(() => {});
    }
  }, [user]);

  const fetchResults = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900">Search Prompts</h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by title, category, or tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-400">
            {isLoading
              ? "Searching..."
              : `${results.length} prompt${results.length !== 1 ? "s" : ""} ${
                  query.trim() ? `matching "${query}"` : "total"
                }`}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((prompt) => (
              <PromptCard
                key={prompt.slug}
                prompt={prompt}
                isSaved={savedIds.includes(prompt.id)}
              />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-3 text-stone-400">
              {query.trim()
                ? `No prompts found for "${query}". Try a different search term.`
                : "Start typing to search prompts."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-stone-400">Loading...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
