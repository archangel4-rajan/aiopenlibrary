import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getZapBalance, ensureZapBalance } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Complete - AIOpenLibrary",
};

export default async function ZapSuccessPage() {
  const user = await getUser();

  let balance = 0;
  if (user) {
    await ensureZapBalance(user.id);
    const balanceData = await getZapBalance(user.id);
    balance = balanceData?.balance ?? 0;
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />

        <h1 className="mt-6 text-3xl font-bold text-stone-900 dark:text-stone-100">
          Your Zaps have been added!
        </h1>
        <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
          Thank you for your purchase. Your Zaps are ready to use.
        </p>

        {user && (
          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-800 dark:bg-amber-900/20">
            <span className="text-2xl">⚡</span>
            <div className="text-left">
              <p className="text-sm text-amber-600 dark:text-amber-500">Current Balance</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {balance.toLocaleString()} Zaps
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Browse Prompts
          </Link>
          <Link
            href="/packs"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            Browse Packs
          </Link>
        </div>
      </div>
    </div>
  );
}
