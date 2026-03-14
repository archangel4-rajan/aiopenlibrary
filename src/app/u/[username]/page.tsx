export const revalidate = 1800;

import { notFound } from "next/navigation";
import Image from "next/image";
import { Bookmark, Heart, FileText, MapPin, Globe, Calendar, Link as LinkIcon } from "lucide-react";
import {
  getProfileByUsername,
  getPublishedPromptsByCreator,
  getCreatorStats,
  getUserLikedPrompts,
  getUserSavedPromptIds,
} from "@/lib/db";
import { getUser } from "@/lib/auth";
import PromptCard from "@/components/PromptCard";
import PublicProfileTabs from "./PublicProfileTabs";
import CopyProfileUrl from "./CopyProfileUrl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return {};

  const displayName = profile.display_name || profile.username || "User";
  return {
    title: `${displayName} - AIOpenLibrary`,
    description:
      profile.bio || `${displayName}'s profile on AIOpenLibrary.`,
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [stats, prompts, likedPrompts, currentUser] = await Promise.all([
    getCreatorStats(profile.id),
    getPublishedPromptsByCreator(profile.id),
    getUserLikedPrompts(profile.id),
    getUser(),
  ]);

  const savedIds = currentUser ? await getUserSavedPromptIds(currentUser.id) : [];
  const savedSet = new Set(savedIds);

  const displayName = profile.display_name || profile.username || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const joinedAgo = timeAgo(profile.created_at);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Banner */}
      {profile.banner_url ? (
        <div className="h-48 w-full overflow-hidden bg-stone-200 dark:bg-stone-800 sm:h-56">
          <Image
            src={profile.banner_url}
            alt=""
            width={1200}
            height={300}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      ) : (
        <div className="h-32 w-full bg-gradient-to-r from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 sm:h-40" />
      )}

      <div className="mx-auto max-w-5xl px-4 pb-12">
        {/* Avatar + Info */}
        <div className="-mt-12 mb-8 flex flex-col items-center text-center sm:-mt-16">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={112}
              height={112}
              className="h-24 w-24 rounded-full border-4 border-white object-cover dark:border-stone-950 sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-stone-200 text-3xl font-bold text-stone-600 dark:border-stone-950 dark:bg-stone-800 dark:text-stone-300 sm:h-28 sm:w-28">
              {initial}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {displayName}
          </h1>

          {profile.username && (
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              @{profile.username}
            </p>
          )}

          {profile.bio && (
            <p className="mt-3 max-w-lg text-stone-600 dark:text-stone-300">
              {profile.bio}
            </p>
          )}

          {/* Meta info row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-500 dark:text-stone-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-300"
              >
                <Globe className="h-3.5 w-3.5" />
                {profile.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {joinedAgo}
            </span>
          </div>

          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-6 text-sm text-stone-500 dark:text-stone-400">
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

          {/* Copy URL button */}
          <div className="mt-4">
            <CopyProfileUrl username={profile.username!} />
          </div>
        </div>

        {/* Tabs: Prompts / Liked */}
        <PublicProfileTabs
          prompts={prompts}
          likedPrompts={likedPrompts}
          savedSet={Array.from(savedSet)}
        />
      </div>
    </div>
  );
}
