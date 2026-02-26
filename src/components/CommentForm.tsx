"use client";

import { useState } from "react";

const MAX_CHARS = 2000;

interface CommentFormProps {
  promptId: string;
  parentId?: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export default function CommentForm({
  promptId,
  parentId,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = content.trim().length === 0;
  const isDisabled = isEmpty || isOverLimit || isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), parent_id: parentId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to post comment");
      }

      setContent("");
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Share your thoughts..."
          rows={parentId ? 3 : 4}
          className="w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-700"
        />
        <div
          className={`mt-1 text-right text-xs ${
            isOverLimit
              ? "text-red-500 dark:text-red-400"
              : "text-stone-400 dark:text-stone-500"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex items-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 dark:disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="-ml-0.5 mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Posting...
            </>
          ) : (
            "Post Comment"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
