"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Library, ArrowRight, FolderPlus, AlertCircle, Settings, ExternalLink } from "lucide-react";
import LibraryFilter from "@/components/LibraryFilter";
import SkeletonCard from "@/components/SkeletonCard";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/AuthProvider";
import type { DbPrompt } from "@/lib/types";

interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id?: string;
  email?: string;
  display_name: string | null;
  avatar_url: string | null;
  username?: string | null;
  bio?: string | null;
  role?: string;
}

async function fetchWithAuth<T>(url: string, fallback: T): Promise<{ data: T; authed: boolean }> {
  try {
    const res = await fetch(url);
    if (res.status === 401) {
      return { data: fallback, authed: false };
    }
    if (!res.ok) {
      return { data: fallback, authed: true };
    }
    const data = await res.json();
    return { data, authed: true };
  } catch {
    return { data: fallback, authed: true };
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [savedPrompts, setSavedPrompts] = useState<DbPrompt[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "collections">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const { isCreator } = useAuth();
  const [creatorUsername, setCreatorUsername] = useState("");
  const [creatorBio, setCreatorBio] = useState("");
  const [creatorSaving, setCreatorSaving] = useState(false);
  const [creatorSuccess, setCreatorSuccess] = useState(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user — this is the auth gate
        const userResult = await fetchWithAuth<{ id?: string; email?: string; error?: string }>(
          "/api/auth/user",
          { error: "Unauthorized" }
        );

        if (!userResult.authed || !userResult.data?.id) {
          window.location.href = "/auth/login";
          return;
        }

        const userData = userResult.data;
        setEmail(userData.email || "");

        // Fetch remaining data in parallel — all auth-gated but we know we're logged in
        const [profileResult, savedIdsResult, collectionsResult] = await Promise.all([
          fetchWithAuth<UserProfile>("/api/user/profile", { display_name: null, avatar_url: null }),
          fetchWithAuth<string[]>("/api/user/saved-ids", []),
          fetchWithAuth<Collection[]>("/api/collections", []),
        ]);

        // Handle any individual 401s (session expired mid-request)
        if (!profileResult.authed || !savedIdsResult.authed || !collectionsResult.authed) {
          window.location.href = "/auth/login";
          return;
        }

        setProfile(profileResult.data);
        setCreatorUsername(profileResult.data?.username || "");
        setCreatorBio(profileResult.data?.bio || "");

        const ids = Array.isArray(savedIdsResult.data) ? savedIdsResult.data : [];
        setSavedIds(ids);

        const colls = Array.isArray(collectionsResult.data) ? collectionsResult.data : [];
        setCollections(colls);

        // Fetch saved prompt details
        if (ids.length > 0) {
          const promptResult = await fetchWithAuth<{ prompts: DbPrompt[] }>(
            `/api/prompts?ids=${ids.join(",")}`,
            { prompts: [] }
          );
          setSavedPrompts(promptResult.data.prompts || []);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Something went wrong loading your profile. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCollection = async () => {
    const name = prompt("Enter collection name:");
    if (!name?.trim()) return;

    const description = prompt("Enter collection description (optional):");

    try {
      setCollectionLoading(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description || "" }),
      });

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create collection" }));
        alert(err.error || "Failed to create collection");
        return;
      }

      const newCollection = await res.json();
      setCollections([newCollection, ...collections]);
    } catch (err) {
      console.error("Error creating collection:", err);
      alert("Failed to create collection. Please try again.");
    } finally {
      setCollectionLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-4 text-stone-600 dark:text-stone-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Profile" },
          ]}
        />

        {/* Profile Header */}
        {loading ? (
          <div className="mb-10 flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
        ) : (
          <div className="mb-10 flex items-center gap-4">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || "User"}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-xl font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                {(profile?.display_name || email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {profile?.display_name || "Your Profile"}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-300">
                {email}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            }`}
          >
            All Saved
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === "collections"
                ? "border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            }`}
          >
            Collections
          </button>
        </div>

        {/* All Saved Tab */}
        {activeTab === "all" && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Library className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Your Library
              </h2>
              <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {savedPrompts.length}
              </span>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : savedPrompts.length > 0 ? (
              <LibraryFilter prompts={savedPrompts} savedIds={savedIds} />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
                <Library className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-base text-stone-400 dark:text-stone-500">
                  Your library is empty.
                </p>
                <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
                  Browse prompts and click the bookmark icon to save them to
                  your library.
                </p>
                <Link
                  href="/categories"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  Browse Prompts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === "collections" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Collections
              </h2>
              <button
                onClick={handleCreateCollection}
                disabled={collectionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50"
              >
                <FolderPlus className="h-4 w-4" />
                Create Collection
              </button>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : collections.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/profile/collections/${collection.id}`}
                    className="group rounded-lg border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
                  >
                    <h3 className="mb-2 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
                      {collection.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                      {collection.description || "No description"}
                    </p>
                    <div className="space-y-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                      <div className="text-xs text-stone-400 dark:text-stone-500">
                        Updated {formatDate(collection.updated_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
                <Library className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-base text-stone-400 dark:text-stone-500">
                  No collections yet.
                </p>
                <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
                  Create a collection to organize your saved prompts.
                </p>
                <button
                  onClick={handleCreateCollection}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Collection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Creator Settings */}
        {isCreator && !loading && (
          <div className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-700">
            <div className="mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Creator Settings
              </h2>
            </div>

            <div className="max-w-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Username
                </label>
                <input
                  type="text"
                  value={creatorUsername}
                  onChange={(e) => setCreatorUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="your-username"
                  maxLength={30}
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
                />
                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                  3-30 characters, lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Bio
                </label>
                <textarea
                  value={creatorBio}
                  onChange={(e) => setCreatorBio(e.target.value.slice(0, 200))}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  maxLength={200}
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
                />
                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                  {creatorBio.length}/200 characters
                </p>
              </div>

              {creatorError && (
                <p className="text-sm text-red-600 dark:text-red-400">{creatorError}</p>
              )}
              {creatorSuccess && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Settings saved!</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setCreatorSaving(true);
                    setCreatorError(null);
                    setCreatorSuccess(false);
                    try {
                      const res = await fetch("/api/user/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          display_name: profile?.display_name,
                          username: creatorUsername || null,
                          bio: creatorBio || null,
                        }),
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "Failed to save");
                      }
                      setCreatorSuccess(true);
                      setTimeout(() => setCreatorSuccess(false), 3000);
                    } catch (err) {
                      setCreatorError(err instanceof Error ? err.message : "Failed to save");
                    } finally {
                      setCreatorSaving(false);
                    }
                  }}
                  disabled={creatorSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  {creatorSaving ? "Saving..." : "Save Settings"}
                </button>
                {creatorUsername && (
                  <Link
                    href={`/creators/${creatorUsername}`}
                    className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Public Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
