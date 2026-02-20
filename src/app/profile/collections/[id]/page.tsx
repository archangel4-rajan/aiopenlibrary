"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Edit2, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import PromptCard from "@/components/PromptCard";
import SkeletonCard from "@/components/SkeletonCard";
import type { DbPrompt } from "@/lib/types";

interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [prompts, setPrompts] = useState<DbPrompt[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);

        // Fetch collection details
        const collRes = await fetch(`/api/collections/${collectionId}`);
        if (!collRes.ok) {
          router.push("/profile");
          return;
        }
        const collData = await collRes.json();
        setCollection(collData);
        setEditName(collData.name);
        setEditDescription(collData.description);

        // Fetch collection prompts via the API that returns prompt details
        const promptsRes = await fetch(`/api/collections/${collectionId}/prompts`);
        if (promptsRes.ok) {
          const promptIds = await promptsRes.json();

          // Fetch the actual prompt details
          if (promptIds && promptIds.length > 0) {
            const detailRes = await fetch(
              `/api/prompts?ids=${promptIds.join(",")}`
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              setPrompts(detailData.prompts || []);
            }
          }
        }

        // Fetch saved IDs for bookmark status
        const savedRes = await fetch("/api/user/saved-ids");
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedIds(Array.isArray(savedData) ? savedData : []);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId, router]);

  const handleSaveChanges = async () => {
    if (!editName.trim()) return;

    try {
      setSaveLoading(true);
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCollection(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/profile?tab=collections");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleRemovePrompt = async (promptId: string) => {
    try {
      const res = await fetch(
        `/api/collections/${collectionId}/prompts/${promptId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setPrompts(prompts.filter((p) => p.id !== promptId));
      }
    } catch (error) {
      console.error("Error removing prompt:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Profile", href: "/profile" },
              { label: "Collection" },
            ]}
          />
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="h-8 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="text-center">
            <p className="text-stone-500 dark:text-stone-400">
              Collection not found.
            </p>
            <Link
              href="/profile"
              className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Back to Profile
            </Link>
          </div>
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
            { label: "Profile", href: "/profile" },
            { label: collection.name },
          ]}
        />

        {/* Collection Header */}
        <div className="mb-10">
          {editing ? (
            <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-900">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={saveLoading || !editName.trim()}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditName(collection.name);
                    setEditDescription(collection.description);
                  }}
                  className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {collection.name}
                </h1>
                <p className="mt-2 text-stone-500 dark:text-stone-400">
                  {collection.description}
                </p>
                <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
                  {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} •{" "}
                  Updated{" "}
                  {new Date(collection.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteCollection}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prompts Grid */}
        {prompts.length > 0 ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Prompts in this collection
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="group relative">
                  <PromptCard
                    prompt={prompt}
                    isSaved={savedIds.includes(prompt.id)}
                  />
                  <button
                    onClick={() => handleRemovePrompt(prompt.id)}
                    className="absolute right-2 top-2 hidden rounded-lg bg-red-500 p-1.5 text-white opacity-0 transition-all group-hover:opacity-100 dark:bg-red-600"
                    title="Remove from collection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
            <p className="text-base text-stone-400 dark:text-stone-500">
              No prompts in this collection yet.
            </p>
            <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
              Browse your library and add prompts to this collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
