"use client";

import { useState } from "react";
import type { DbPrompt } from "@/lib/types";
import PromptCard from "@/components/PromptCard";

interface PublicProfileTabsProps {
  prompts: DbPrompt[];
  likedPrompts: DbPrompt[];
  savedSet: string[];
}

export default function PublicProfileTabs({
  prompts,
  likedPrompts,
  savedSet,
}: PublicProfileTabsProps) {
  const [tab, setTab] = useState<"prompts" | "liked">("prompts");
  const saved = new Set(savedSet);

  return (
    <>
      <div className="mb-6 flex gap-4 border-b border-stone-200 dark:border-stone-700">
        <button
          onClick={() => setTab("prompts")}
          className={`pb-3 px-2 font-medium transition-colors ${
            tab === "prompts"
              ? "border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100"
              : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
          }`}
        >
          Prompts ({prompts.length})
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`pb-3 px-2 font-medium transition-colors ${
            tab === "liked"
              ? "border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100"
              : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
          }`}
        >
          Liked ({likedPrompts.length})
        </button>
      </div>

      {tab === "prompts" && (
        prompts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isSaved={saved.has(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-stone-500 dark:text-stone-400">
            No prompts published yet.
          </p>
        )
      )}

      {tab === "liked" && (
        likedPrompts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {likedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isSaved={saved.has(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-stone-500 dark:text-stone-400">
            No liked prompts yet.
          </p>
        )
      )}
    </>
  );
}
