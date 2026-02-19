/**
 * Database query layer for AIOpenLibrary.
 *
 * All functions query Supabase directly — no fallback data.
 * Each function returns a sensible empty value on error ([], null, 0)
 * so callers can render gracefully without try/catch.
 */

import { createClient } from "@/lib/supabase/server";
import type { DbPrompt, DbCategory, DbProfile, DbPromptVote } from "@/lib/types";
import { sanitizeSearchQuery } from "@/lib/db-utils";

// ============================================
// CATEGORIES
// ============================================

/** Returns all categories ordered by name. */
export async function getCategories(): Promise<DbCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns a single category by slug, or null if not found. */
export async function getCategoryBySlug(
  slug: string
): Promise<DbCategory | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// ============================================
// PROMPTS
// ============================================

/** Returns all published prompts ordered by saves descending. */
export async function getPrompts(): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (error) {
      console.error("Error fetching prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns a single published prompt by slug, or null if not found. */
export async function getPromptBySlug(
  slug: string
): Promise<DbPrompt | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns a single prompt by ID (including unpublished), or null. */
export async function getPromptById(id: string): Promise<DbPrompt | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns published prompts for a category, ordered by saves descending. */
export async function getPromptsByCategory(
  categorySlug: string
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("category_slug", categorySlug)
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (error) {
      console.error("Error fetching category prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns the top N published prompts by saves count. */
export async function getFeaturedPrompts(
  limit: number = 6
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .order("saves_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Searches published prompts by title, description, or category name. */
export async function searchPrompts(query: string): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const q = query.trim();

    if (!q) {
      return getPrompts();
    }

    const sanitized = sanitizeSearchQuery(q);

    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .or(
        `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,category_name.ilike.%${sanitized}%`
      )
      .order("saves_count", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error searching prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns the total count of published prompts. */
export async function getPromptsCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("prompts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Returns a map of category_slug → prompt count for published prompts. */
export async function getCategoryPromptCounts(): Promise<
  Record<string, number>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("category_slug")
      .eq("is_published", true);

    if (error) return {};

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.category_slug] = (counts[row.category_slug] || 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

// ============================================
// ADMIN: All prompts (including unpublished)
// ============================================

/** Returns all prompts for admin view, including unpublished. */
export async function getAllPromptsAdmin(): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

// ============================================
// SAVED PROMPTS
// ============================================

/** Checks whether a specific prompt is saved by a user. */
export async function isPromptSavedByUser(
  promptId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_prompts")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/** Returns all published prompts saved by a user. */
export async function getUserSavedPrompts(
  userId: string
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_prompts")
      .select("prompt_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    const promptIds = data.map((s) => s.prompt_id);
    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds)
      .eq("is_published", true);

    if (promptsError) return [];
    return prompts ?? [];
  } catch {
    return [];
  }
}

/** Returns an array of prompt IDs saved by a user. */
export async function getUserSavedPromptIds(
  userId: string
): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_prompts")
      .select("prompt_id")
      .eq("user_id", userId);

    if (error) return [];
    return (data ?? []).map((s) => s.prompt_id);
  } catch {
    return [];
  }
}

// ============================================
// VOTES (Like / Dislike)
// ============================================

/** Returns the user's vote on a specific prompt, or null if no vote. */
export async function getUserVote(
  promptId: string,
  userId: string
): Promise<DbPromptVote | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_votes")
      .select("*")
      .eq("prompt_id", promptId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns all prompt IDs that a user has voted on, with their vote types. */
export async function getUserVotedPromptIds(
  userId: string
): Promise<Record<string, "like" | "dislike">> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_votes")
      .select("prompt_id, vote_type")
      .eq("user_id", userId);

    if (error) return {};

    const votes: Record<string, "like" | "dislike"> = {};
    for (const row of data ?? []) {
      votes[row.prompt_id] = row.vote_type;
    }
    return votes;
  } catch {
    return {};
  }
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardPrompt extends DbPrompt {
  weekly_saves: number;
}

/** Returns leaderboard prompts ranked by weekly saves, falling back to total saves. */
export async function getLeaderboardPrompts(
  limit: number = 20
): Promise<LeaderboardPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_weekly_leaderboard", {
      limit_count: limit,
    });

    if (error || !data || data.length === 0) {
      // If no weekly saves, fall back to top prompts by total saves
      const { data: topPrompts } = await supabase
        .from("prompts")
        .select("*")
        .eq("is_published", true)
        .order("saves_count", { ascending: false })
        .limit(limit);

      return (topPrompts ?? []).map((p) => ({
        ...p,
        weekly_saves: 0,
      }));
    }

    return data as LeaderboardPrompt[];
  } catch {
    return [];
  }
}

// ============================================
// RECENTLY ADDED
// ============================================

/** Returns the most recently published prompts. */
export async function getRecentPrompts(
  limit: number = 6
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

// ============================================
// CROSS-CATEGORY RELATED PROMPTS
// ============================================

/** Returns prompts from other categories that share tags with the given prompt. */
export async function getRelatedPromptsByTags(
  promptId: string,
  tags: string[],
  categorySlug: string,
  limit: number = 3
): Promise<DbPrompt[]> {
  try {
    if (tags.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .neq("id", promptId)
      .neq("category_slug", categorySlug)
      .overlaps("tags", tags)
      .order("saves_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching related prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

// ============================================
// FILTERED SEARCH
// ============================================

/** Searches published prompts with optional filters. */
export async function searchPromptsWithFilters(
  query: string,
  filters: {
    category?: string;
    difficulty?: string;
    model?: string;
  } = {}
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    let builder = supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true);

    const q = query.trim();
    if (q) {
      const sanitized = sanitizeSearchQuery(q);
      builder = builder.or(
        `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,category_name.ilike.%${sanitized}%`
      );
    }

    if (filters.category) {
      builder = builder.eq("category_slug", filters.category);
    }
    if (filters.difficulty) {
      builder = builder.eq("difficulty", filters.difficulty);
    }
    if (filters.model) {
      builder = builder.eq("recommended_model", filters.model);
    }

    const { data, error } = await builder
      .order("saves_count", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error searching prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

// ============================================
// COLLECTIONS
// ============================================

export interface DbCollection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/** Returns all collections for a user. */
export async function getUserCollections(
  userId: string
): Promise<DbCollection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as DbCollection[];
  } catch {
    return [];
  }
}

/** Returns prompt IDs in a specific collection. */
export async function getCollectionPromptIds(
  collectionId: string
): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collection_prompts")
      .select("prompt_id")
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map((r) => r.prompt_id);
  } catch {
    return [];
  }
}

/** Returns prompts in a specific collection. */
export async function getCollectionPrompts(
  collectionId: string
): Promise<DbPrompt[]> {
  try {
    const promptIds = await getCollectionPromptIds(collectionId);
    if (promptIds.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds)
      .eq("is_published", true);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns a single collection by ID, or null. */
export async function getCollectionById(
  collectionId: string
): Promise<DbCollection | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (error) return null;
    return data as DbCollection;
  } catch {
    return null;
  }
}

// ============================================
// PROFILES
// ============================================

/** Returns a user's profile by ID, or null if not found. */
export async function getUserProfile(
  userId: string
): Promise<DbProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
