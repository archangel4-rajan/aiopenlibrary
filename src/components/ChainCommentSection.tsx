"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import ChainComment from "./ChainComment";
import ChainCommentForm from "./ChainCommentForm";
import type { ChainCommentWithAuthor } from "@/lib/types";

interface ChainCommentSectionProps {
  chainSlug: string;
}

export default function ChainCommentSection({ chainSlug }: ChainCommentSectionProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<ChainCommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/chains/${chainSlug}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data.comments ?? data ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [chainSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0
  );

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2.5 mb-6">
        <MessageCircle className="h-5 w-5 text-stone-600 dark:text-stone-400" />
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Comments
        </h2>
        {totalCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {totalCount}
          </span>
        )}
      </div>

      {user ? (
        <div className="mb-8">
          <ChainCommentForm chainSlug={chainSlug} onSubmit={fetchComments} />
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-stone-200 bg-stone-50 px-5 py-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <Link
              href="/auth/login"
              className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-2 transition-colors hover:decoration-stone-900 dark:text-stone-100 dark:decoration-stone-600 dark:hover:decoration-stone-100"
            >
              Log in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-200 dark:bg-stone-800" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
                    <div className="h-3 w-16 rounded bg-stone-100 dark:bg-stone-800/60" />
                  </div>
                  <div className="h-4 w-full rounded bg-stone-100 dark:bg-stone-800/60" />
                  <div className="h-4 w-3/4 rounded bg-stone-100 dark:bg-stone-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {comments.map((comment) => (
            <ChainComment
              key={comment.id}
              comment={comment}
              chainSlug={chainSlug}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-300 px-6 py-10 text-center dark:border-stone-700">
          <MessageCircle className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </section>
  );
}
