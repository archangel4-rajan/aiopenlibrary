"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ChainRunner from "@/components/ChainRunner";
import type { ChainWithSteps } from "@/lib/types";

export default function ChainRunPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [chain, setChain] = useState<ChainWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChain() {
      try {
        const res = await fetch(`/api/chains/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/chains");
            return;
          }
          throw new Error("Failed to load chain");
        }
        const data = await res.json();

        // If premium and not purchased, redirect back to chain page
        if (data.is_premium && !data.isPurchased) {
          router.push(`/chains/${slug}`);
          return;
        }

        setChain(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchChain();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="flex gap-6">
              <div className="hidden w-56 space-y-2 lg:block">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-stone-200 dark:bg-stone-800"
                  />
                ))}
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-8 w-64 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="h-4 w-full rounded bg-stone-200 dark:bg-stone-800" />
                <div className="h-48 rounded-lg bg-stone-200 dark:bg-stone-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-stone-500 dark:text-stone-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!chain) return null;

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <ChainRunner chain={chain} />
      </div>
    </div>
  );
}
