"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import type { CommentWithAuthor } from "@/lib/types";
import CommentForm from "./CommentForm";

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return "just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface CommentProps {
  comment: CommentWithAuthor;
  promptId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onRefresh: () => void;
}

export default function Comment({
  comment,
  promptId,
  currentUserId,
  isAdmin,
  onRefresh,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete =
    currentUserId === comment.user_id || isAdmin;

  const displayName =
    comment.author.display_name || "Anonymous";

  const initial = displayName.charAt(0).toUpperCase();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/prompts/${promptId}/comments/${comment.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete comment");
      }

      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  }

  if (comment.is_deleted) {
    return (
      <div className="py-3">
        <p className="text-sm italic text-stone-400 dark:text-stone-500">
          [deleted]
        </p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-stone-200 pl-4 dark:border-stone-700 ml-8">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                promptId={promptId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.author.avatar_url ? (
          <Image
            src={comment.author.avatar_url}
            alt={displayName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Author name + timestamp */}
          <div className="flex items-center gap-2">
            {comment.author.username ? (
              <Link
                href={`/creators/${comment.author.username}`}
                className="text-sm font-medium text-stone-900 hover:underline dark:text-stone-100"
              >
                {displayName}
              </Link>
            ) : (
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {displayName}
              </span>
            )}
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          {/* Content */}
          <p className="mt-1 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-3">
            {/* Reply button: only for top-level comments (no parent_id) */}
            {!comment.parent_id && currentUserId && (
              <button
                type="button"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {showReplyForm ? "Cancel" : "Reply"}
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-stone-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                promptId={promptId}
                parentId={comment.id}
                onSubmit={() => {
                  setShowReplyForm(false);
                  onRefresh();
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-8 space-y-3 border-l-2 border-stone-200 pl-4 dark:border-stone-700">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              promptId={promptId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
