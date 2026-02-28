import type { Metadata } from "next";
import { getZapPackages, getZapBalance, getZapTransactions } from "@/lib/db";
import type { ZapTransaction } from "@/lib/types";
import { getUser } from "@/lib/auth";
import ZapPackageList from "./ZapPackageList";

export const metadata: Metadata = {
  title: "Get Zaps - AIOpenLibrary",
  description: "Purchase Zaps to unlock premium prompts and packs on AIOpenLibrary.",
};

export default async function ZapsPage() {
  const [packages, user] = await Promise.all([
    getZapPackages(),
    getUser(),
  ]);

  let balance = null;
  let transactions: ZapTransaction[] = [];
  if (user) {
    [balance, transactions] = await Promise.all([
      getZapBalance(user.id),
      getZapTransactions(user.id, 20),
    ]);
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
            Get Zaps ⚡
          </h1>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
            Use Zaps to unlock premium prompts and curated packs from top creators.
          </p>

          {user && balance !== null && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <p className="text-sm text-amber-600 dark:text-amber-500">Your Balance</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {(balance?.balance ?? 0).toLocaleString()} Zaps
                </p>
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                <a href="/auth/login" className="font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-300">
                  Sign in
                </a>{" "}
                to purchase Zaps and unlock premium content.
              </p>
            </div>
          )}
        </div>

        <ZapPackageList packages={packages} isLoggedIn={!!user} />

        {/* Recent Transactions */}
        {user && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Recent Transactions
            </h2>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-700">
                      <th className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-stone-500 dark:text-stone-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-stone-500 dark:text-stone-400">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="border-b border-stone-50 last:border-0 dark:border-stone-800"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-stone-500 dark:text-stone-400">
                          {formatRelativeDate(txn.created_at)}
                        </td>
                        <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                          {txn.description}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                            txn.amount >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {txn.amount >= 0 ? "+" : ""}
                          {txn.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 p-8 text-center dark:border-stone-700">
                <p className="text-sm text-stone-400 dark:text-stone-500">
                  No transactions yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
