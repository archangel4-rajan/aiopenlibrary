"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";
import { useRouter } from "next/navigation";

interface UnlockButtonProps {
  promptId: string;
  zapPrice: number;
  creatorId: string;
  isPurchased: boolean;
}

export default function UnlockButton({
  promptId,
  zapPrice,
  creatorId,
  isPurchased,
}: UnlockButtonProps) {
  const { user, zapBalance, refreshZapBalance } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (isPurchased) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
      >
        Unlocked ✓
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        Sign in to unlock
      </Link>
    );
  }

  // Don't show purchase for own prompts
  if (user.id === creatorId) {
    return null;
  }

  const hasEnough = zapBalance >= zapPrice;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/prompts/${promptId}/purchase`, {
        method: "POST",
      });

      if (res.status === 409) {
        // Already purchased — refresh
        router.refresh();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Purchase failed");
      }

      await refreshZapBalance();
      toast({ message: "Prompt unlocked!", type: "success" });
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!hasEnough) {
    const needed = zapPrice - zapBalance;
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/zaps"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
        >
          Need {needed} more Zaps — Get Zaps
        </Link>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        {loading ? (
          "Unlocking..."
        ) : (
          <>
            Unlock — ⚡ {zapPrice}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
