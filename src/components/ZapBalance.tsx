"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function ZapBalance() {
  const { user, zapBalance } = useAuth();

  if (!user) return null;

  return (
    <Link
      href="/zaps"
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
      title="Your Zap balance"
    >
      <span>⚡</span>
      {zapBalance.toLocaleString()}
    </Link>
  );
}
