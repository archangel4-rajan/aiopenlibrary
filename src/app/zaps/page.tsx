import type { Metadata } from "next";
import { getZapPackages, getZapBalance } from "@/lib/db";
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
  if (user) {
    balance = await getZapBalance(user.id);
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
      </div>
    </div>
  );
}
