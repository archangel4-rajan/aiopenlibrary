"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface NewsletterCTAProps {
  user?: { id: string; email: string } | null;
}

export default function NewsletterCTA({ user }: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e?: React.FormEvent) {
    e?.preventDefault();

    const subscriberEmail = user ? user.email : email.trim();
    if (!subscriberEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriberEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <section className="border-b border-stone-200 dark:border-stone-700 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-xl bg-stone-100 dark:bg-stone-900 px-6 py-10 text-center sm:px-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              You&apos;re subscribed!
            </p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-stone-200 dark:border-stone-700 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-stone-100 dark:bg-stone-900 px-6 py-10 text-center sm:px-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
            Stay in the loop
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Get the best new prompts, tips, and AI news delivered weekly. No spam, unsubscribe
            anytime.
          </p>

          {user ? (
            <div className="mt-6">
              <button
                onClick={() => handleSubscribe()}
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-50 px-6 py-2.5 text-sm font-medium text-white dark:text-stone-900 transition-all hover:bg-stone-800 dark:hover:bg-stone-100 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Subscribe to our newsletter
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-colors sm:w-64"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-50 px-6 py-2.5 text-sm font-medium text-white dark:text-stone-900 transition-all hover:bg-stone-800 dark:hover:bg-stone-100 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Subscribe
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
