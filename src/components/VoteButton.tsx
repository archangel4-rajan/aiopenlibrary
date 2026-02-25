"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface VoteButtonProps {
  promptId: string;
  initialVote: "like" | "dislike" | null;
  likesCount: number;
  dislikesCount: number;
}

export default function VoteButton({
  promptId,
  initialVote,
  likesCount,
  dislikesCount,
}: VoteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [vote, setVote] = useState<"like" | "dislike" | null>(initialVote);
  const [likes, setLikes] = useState(likesCount);
  const [dislikes, setDislikes] = useState(dislikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const totalVotes = likes + dislikes;
  const helpfulPercent =
    totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 0;

  const handleVote = async (
    e: React.MouseEvent,
    voteType: "like" | "dislike"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    const prevVote = vote;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    // Optimistic update
    if (vote === voteType) {
      // Toggling off
      setVote(null);
      if (voteType === "like") setLikes((l) => Math.max(0, l - 1));
      else setDislikes((d) => Math.max(0, d - 1));
    } else {
      // Switching or new vote
      if (vote === "like") setLikes((l) => Math.max(0, l - 1));
      if (vote === "dislike") setDislikes((d) => Math.max(0, d - 1));
      setVote(voteType);
      if (voteType === "like") setLikes((l) => l + 1);
      else setDislikes((d) => d + 1);
    }

    try {
      let res: Response;
      if (vote === voteType) {
        // Remove vote
        res = await fetch(`/api/prompts/${promptId}/vote`, {
          method: "DELETE",
        });
      } else {
        // Set vote
        res = await fetch(`/api/prompts/${promptId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote_type: voteType }),
        });
      }

      if (res.status === 401) {
        // Session expired
        setVote(prevVote);
        setLikes(prevLikes);
        setDislikes(prevDislikes);
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setVote(prevVote);
      setLikes(prevLikes);
      setDislikes(prevDislikes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => handleVote(e, "like")}
          disabled={isLoading}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition-all disabled:opacity-50 ${
            vote === "like"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:bg-stone-800"
          }`}
        >
          <ThumbsUp
            className={`h-3.5 w-3.5 ${vote === "like" ? "fill-current" : ""}`}
          />
          <span className="text-xs font-medium">{likes}</span>
        </button>
        <button
          onClick={(e) => handleVote(e, "dislike")}
          disabled={isLoading}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition-all disabled:opacity-50 ${
            vote === "dislike"
              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:bg-stone-800"
          }`}
        >
          <ThumbsDown
            className={`h-3.5 w-3.5 ${vote === "dislike" ? "fill-current" : ""}`}
          />
          <span className="text-xs font-medium">{dislikes}</span>
        </button>
      </div>
      {totalVotes >= 3 && (
        <span className="text-xs text-stone-400 dark:text-stone-500">
          {helpfulPercent}% found helpful
        </span>
      )}
    </div>
  );
}
