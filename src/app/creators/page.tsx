import Link from "next/link";
import Image from "next/image";
import { Users, Bookmark } from "lucide-react";
import { getTopCreators } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators - AIOpenLibrary",
};

export default async function CreatorsPage() {
  const creators = await getTopCreators(50);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <Users className="h-7 w-7 text-stone-700 dark:text-stone-300" />
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Creators
          </h1>
        </div>

        {/* Creator grid */}
        {creators.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => {
              const href = `/creators/${creator.username || creator.id}`;
              const displayName =
                creator.display_name || creator.username || "Creator";
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <Link
                  key={creator.id}
                  href={href}
                  className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
                >
                  {/* Avatar */}
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-200 text-lg font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      {initial}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                      {displayName}
                    </p>
                    {creator.username && (
                      <p className="truncate text-sm text-stone-500">
                        @{creator.username}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span>
                        {creator.promptCount} prompt
                        {creator.promptCount !== 1 ? "s" : ""}
                      </span>
                      <span className="text-stone-300 dark:text-stone-600">
                        &middot;
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {creator.totalSaves} save
                        {creator.totalSaves !== 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-stone-500 dark:text-stone-400">
            No creators found.
          </p>
        )}
      </div>
    </div>
  );
}
