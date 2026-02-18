import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getUserProfile, getUserSavedPrompts, getUserSavedPromptIds } from "@/lib/db";
import PromptCard from "@/components/PromptCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Prompts - AIOpenLibrary",
};

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [profile, savedPrompts, savedIds] = await Promise.all([
    getUserProfile(user.id),
    getUserSavedPrompts(user.id),
    getUserSavedPromptIds(user.id),
  ]);

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Profile Header */}
        <div className="mb-10 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || "User"}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-xl font-bold text-stone-700">
              {(profile?.display_name || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {profile?.display_name || "Your Profile"}
            </h1>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
        </div>

        {/* Saved Prompts */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-stone-600" />
            <h2 className="text-xl font-bold text-stone-900">Saved Prompts</h2>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600">
              {savedPrompts.length}
            </span>
          </div>

          {savedPrompts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.slug}
                  prompt={prompt}
                  isSaved={savedIds.includes(prompt.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
              <Bookmark className="mx-auto h-10 w-10 text-stone-300" />
              <p className="mt-3 text-base text-stone-400">
                You haven&apos;t saved any prompts yet.
              </p>
              <p className="mt-1 text-sm text-stone-400">
                Browse prompts and click the bookmark icon to save them here.
              </p>
              <Link
                href="/categories"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
              >
                Browse Prompts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
