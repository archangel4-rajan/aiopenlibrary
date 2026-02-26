"use client";

import { useState } from "react";
import type { ZapPackage } from "@/lib/types";

interface ZapPackageListProps {
  packages: ZapPackage[];
  isLoggedIn: boolean;
}

export default function ZapPackageList({ packages, isLoggedIn }: ZapPackageListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (packageId: string) => {
    setLoadingId(packageId);
    setError(null);

    try {
      const res = await fetch("/api/zaps/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (res.status === 503) {
        setError("Payments coming soon! Zap purchases will be available shortly.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getRate = (cents: number, zaps: number) => {
    return `$${(cents / 100 / zaps).toFixed(3)}/Zap`;
  };

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {packages.map((pkg) => {
          const isPopular = pkg.name.toLowerCase().includes("popular");
          return (
            <div
              key={pkg.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isPopular
                  ? "border-amber-300 bg-amber-50/50 shadow-md dark:border-amber-700 dark:bg-amber-900/10"
                  : "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {pkg.name}
                </h3>
                <div className="mt-3 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    ⚡ {pkg.zap_amount.toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {formatPrice(pkg.price_cents)}
                </p>
                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                  {getRate(pkg.price_cents, pkg.zap_amount)}
                </p>
              </div>

              <button
                onClick={() => isLoggedIn ? handleBuy(pkg.id) : window.location.href = "/auth/login"}
                disabled={loadingId === pkg.id}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isPopular
                    ? "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                    : "bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                }`}
              >
                {loadingId === pkg.id
                  ? "Processing..."
                  : isLoggedIn
                  ? "Buy"
                  : "Sign in to Buy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
