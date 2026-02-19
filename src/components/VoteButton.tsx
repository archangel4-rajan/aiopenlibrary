"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface VoteButtonProps {
  promptId: string;
  /** The user's current vote, if any. */
  initialVote: "like" | "dislike" | null;
  likesCount: number;
  dislikesCount: number;
}

/**
 * VoteButton — like/dislike with optimistic UI.
 *
 * Displays thumbs-up and thumbs-down buttons with counts.
 * Clicking an active vote removes it; clicking a different vote switches it.
 */
export default function VoteButton({
  promptId,
  initialVote,
  likesCount,
  dislikesCount,
}: VoteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentVote, setCurrentVote] = useState<"like" | "dislike" | null>(
    initialVote
  );
  const [likes, setLikes] = useState(likesCount);
  const [dislikes, setDislikes] = useState(dislikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "like" | "dislike") => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const prevVote = currentVote;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    // Optimistic update
    if (currentVote === voteType) {
      // Toggling off — remove vote
      setCurrentVote(null);
      if (voteType === "like") setLikes((l) => l - 1);
      else setDislikes((d) => d - 1);
    } else {
      // New vote or switching
      if (currentVote === "like") setLikes((l) => l - 1);
      if (currentVote === "dislike") setDislikes((d) => d - 1);
      setCurrentVote(voteType);
      if (voteType === "like") setLikes((l) => l + 1);
      else setDislikes((d) => d + 1);
    }

    try {
      if (currentVote === voteType) {
        // Remove vote
        const res = await fetch(`/api/prompts/${promptId}/vote`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed");
      } else {
        // Upsert vote
        const res = await fetch(`/api/prompts/${promptId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote_type: voteType }),
        });
        if (!res.ok) throw new Error("Failed");
      }
    } catch {
      // Rollback on error
      setCurrentVote(prevVote);
      setLikes(prevLikes);
      setDislikes(prevDislikes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("like");
        }}
        disabled={isLoading}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
          currentVote === "like"
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
        }`}
        aria-label="Like this prompt"
      >
        <ThumbsUp
          className={`h-3.5 w-3.5 ${currentVote === "like" ? "fill-current" : ""}`}
        />
        <span>{likes}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("dislike");
        }}
        disabled={isLoading}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
          currentVote === "dislike"
            ? "border-red-300 bg-red-50 text-red-700"
            : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
        }`}
        aria-label="Dislike this prompt"
      >
        <ThumbsDown
          className={`h-3.5 w-3.5 ${currentVote === "dislike" ? "fill-current" : ""}`}
        />
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
