"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");
  const [error, setError] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
  const [message] = useState<string | null>(urlMessage ? decodeURIComponent(urlMessage) : null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Sign in to save prompts and access your library
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            {message}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition-all hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-stone-50 px-2 text-stone-400 dark:bg-stone-950 dark:text-stone-500">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
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
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-400 dark:focus:ring-stone-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-100"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-stone-900 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
          By signing in, you agree to our{" "}
          <Link
            href="/about"
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            terms
          </Link>
          . We&apos;ll never share your data.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
