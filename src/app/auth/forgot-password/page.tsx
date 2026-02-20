"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              AIOpenLibrary
            </span>
          </Link>
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              We sent a password reset link to <strong>{email}</strong>. Click
              the link to set a new password.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              &larr; Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              AIOpenLibrary
            </span>
          </Link>
          <h1 className="mt-8 text-2xl font-bold text-stone-900 dark:text-stone-100">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-400 dark:focus:ring-stone-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-100"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
