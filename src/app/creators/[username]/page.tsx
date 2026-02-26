import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Heart, FileText } from "lucide-react";
import {
  getCreatorByUsername,
  getPublishedPromptsByCreator,
  getCreatorStats,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) return {};

  return {
    title: `${creator.display_name || creator.username || "Creator"}'s Prompts - AIOpenLibrary`,
    description:
      creator.bio || `Browse prompts by ${creator.display_name || creator.username}.`,
  };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) notFound();

  const [stats, prompts, user] = await Promise.all([
    getCreatorStats(creator.id),
    getPublishedPromptsByCreator(creator.id),
    getUser(),
  ]);

  const savedIds = user ? await getUserSavedPromptIds(user.id) : [];
  const savedSet = new Set(savedIds);

  const displayName = creator.display_name || creator.username || "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Profile header */}
        <div className="mb-10 flex flex-col items-center text-center">
          {creator.avatar_url ? (
            <Image
              src={creator.avatar_url}
              alt={displayName}
              width={96}
              height={96}
              className="mb-4 rounded-full object-cover"
            />
          ) : (
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-stone-200 text-3xl font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {initial}
            </div>
          )}

          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {displayName}
          </h1>

          {creator.username && (
            <p className="mt-1 text-sm text-stone-500">@{creator.username}</p>
          )}

          {creator.bio && (
            <p className="mt-3 max-w-lg text-stone-600 dark:text-stone-300">
              {creator.bio}
            </p>
          )}

          {/* Stats bar */}
          <div className="mt-6 flex items-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {stats.totalPrompts} prompt{stats.totalPrompts !== 1 ? "s" : ""}
            </span>
            <span className="text-stone-300 dark:text-stone-600">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-4 w-4" />
              {stats.totalSaves} save{stats.totalSaves !== 1 ? "s" : ""}
            </span>
            <span className="text-stone-300 dark:text-stone-600">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {stats.totalLikes} like{stats.totalLikes !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Prompts grid */}
        {prompts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isSaved={savedSet.has(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone-500 dark:text-stone-400">
            This creator hasn&apos;t published any prompts yet.
          </p>
        )}
      </div>
    </div>
  );
}
