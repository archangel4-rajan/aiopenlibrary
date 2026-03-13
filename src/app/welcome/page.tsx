"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import UsernameForm from "@/components/UsernameForm";

export default function WelcomePage() {
  const router = useRouter();
  const [suggestedUsername, setSuggestedUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current profile to get email for suggestion
    const init = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        const profile = await res.json();
        // If user already has a username, redirect to home
        if (profile.username) {
          document.cookie = "has_username=1; path=/; max-age=31536000; samesite=lax";
          router.push("/");
          return;
        }
        // Suggest username from email or display name
        const base = (profile.display_name || profile.email?.split("@")[0] || "")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 25);
        setSuggestedUsername(base);
      } catch {
        // Continue with empty suggestion
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSave = async (username: string, bio: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio: bio || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Failed to save" };
      }
      // Set cookie so middleware doesn't redirect again
      document.cookie = "has_username=1; path=/; max-age=31536000; samesite=lax";
      router.push("/");
      return {};
    } catch {
      return { error: "Something went wrong. Please try again." };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={64} className="mb-4 h-16 w-16" />
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Welcome to AIOpenLibrary
          </h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            Choose a username for your public profile. You can change this later.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
          <UsernameForm
            initialUsername={suggestedUsername}
            initialBio=""
            onSave={handleSave}
            submitLabel="Continue"
          />
        </div>
      </div>
    </div>
  );
}
