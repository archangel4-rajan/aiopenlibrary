/**
 * Database query layer for AIOpenLibrary.
 *
 * All functions query Supabase directly — no fallback data.
 * Each function returns a sensible empty value on error ([], null, 0)
 * so callers can render gracefully without try/catch.
 */

import { createClient } from "@/lib/supabase/server";
import type { DbPrompt, DbCategory, DbProfile, DbPromptVote, CommentWithAuthor, ZapBalance, ZapTransaction, ZapPackage, PromptPack, UserPurchase, DbChain, ChainStepWithPrompt, ChainCommentWithAuthor } from "@/lib/types";
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
// CREATOR: Own prompts (including unpublished)
// ============================================

/** Returns all prompts created by a specific user, including unpublished. */
export async function getPromptsByCreator(userId: string): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching creator prompts:", error);
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

export type LeaderboardSort = "saved" | "liked" | "trending" | "newest";

const VALID_SORTS: ReadonlySet<string> = new Set(["saved", "liked", "trending", "newest"]);

/** Validate and sanitize sort param at runtime. Returns a safe LeaderboardSort. */
export function validateLeaderboardSort(input: unknown): LeaderboardSort {
  if (typeof input === "string" && VALID_SORTS.has(input)) {
    return input as LeaderboardSort;
  }
  return "saved";
}

/** Coalesce nullable numeric fields to 0. */
function normalizePrompt(p: Record<string, unknown>): LeaderboardPrompt {
  return {
    ...p,
    saves_count: (p.saves_count as number) ?? 0,
    likes_count: (p.likes_count as number) ?? 0,
    dislikes_count: (p.dislikes_count as number) ?? 0,
    weekly_saves: (p.weekly_saves as number) ?? 0,
  } as LeaderboardPrompt;
}

/** Returns leaderboard prompts sorted by the given criterion. */
export async function getLeaderboardPromptsSorted(
  sort: LeaderboardSort = "saved",
  limit: number = 20
): Promise<LeaderboardPrompt[]> {
  // Runtime whitelist — never trust caller even with TS types
  const safeSort = validateLeaderboardSort(sort);

  try {
    const supabase = await createClient();

    if (safeSort === "trending") {
      // Use the weekly leaderboard RPC for trending
      const { data, error } = await supabase.rpc("get_weekly_leaderboard", {
        limit_count: limit,
      });
      if (!error && data && data.length > 0) {
        return (data as Record<string, unknown>[]).map(normalizePrompt);
      }
      // Fall back to saves if no weekly data
      const { data: fallback } = await supabase
        .from("prompts")
        .select("*")
        .eq("is_published", true)
        .order("saves_count", { ascending: false })
        .limit(limit);
      return (fallback ?? []).map((p) => normalizePrompt({ ...p, weekly_saves: 0 }));
    }

    // Static map — only whitelisted column names, never user input
    const orderColumn =
      safeSort === "liked" ? "likes_count" :
      safeSort === "newest" ? "created_at" :
      "saves_count";

    const { data } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .order(orderColumn, { ascending: false })
      .limit(limit);

    return (data ?? []).map((p) => normalizePrompt({ ...p, weekly_saves: 0 }));
  } catch {
    return [];
  }
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
        `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,category_name.ilike.%${sanitized}%,tags::text.ilike.%${sanitized}%`
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

// ============================================
// CREATOR PROFILES
// ============================================

/** Returns a creator profile by username, or null if not found. */
export async function getCreatorByUsername(
  identifier: string
): Promise<DbProfile | null> {
  try {
    const supabase = await createClient();

    // Try username first
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", identifier)
      .single();

    if (!error && data) return data;

    // Fall back to ID lookup (for creators without usernames)
    const { data: byId, error: idError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", identifier)
      .single();

    if (idError) return null;
    return byId;
  } catch {
    return null;
  }
}

/** Returns published prompts by a creator, ordered by saves desc. */
export async function getPublishedPromptsByCreator(
  userId: string
): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("created_by", userId)
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (error) {
      console.error("Error fetching creator prompts:", error);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns aggregate stats for a creator's published prompts. */
export async function getCreatorStats(
  userId: string
): Promise<{ totalPrompts: number; totalSaves: number; totalLikes: number }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("saves_count, likes_count")
      .eq("created_by", userId)
      .eq("is_published", true);

    if (error || !data) return { totalPrompts: 0, totalSaves: 0, totalLikes: 0 };

    return {
      totalPrompts: data.length,
      totalSaves: data.reduce((sum, p) => sum + (p.saves_count ?? 0), 0),
      totalLikes: data.reduce((sum, p) => sum + (p.likes_count ?? 0), 0),
    };
  } catch {
    return { totalPrompts: 0, totalSaves: 0, totalLikes: 0 };
  }
}

/** Returns top creators with at least 1 published prompt, ordered by total saves. */
export async function getTopCreators(
  limit: number = 20
): Promise<(DbProfile & { promptCount: number; totalSaves: number })[]> {
  try {
    const supabase = await createClient();

    // Get all creators/admins with usernames
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["creator", "admin"]);

    if (profileError || !profiles) return [];

    // Get published prompt stats per creator
    const { data: prompts, error: promptError } = await supabase
      .from("prompts")
      .select("created_by, saves_count")
      .eq("is_published", true)
      .not("created_by", "is", null);

    if (promptError || !prompts) return [];

    // Aggregate per creator
    const statsMap = new Map<string, { count: number; saves: number }>();
    for (const p of prompts) {
      if (!p.created_by) continue;
      const existing = statsMap.get(p.created_by) || { count: 0, saves: 0 };
      existing.count++;
      existing.saves += p.saves_count ?? 0;
      statsMap.set(p.created_by, existing);
    }

    // Merge and filter
    const result = profiles
      .filter((profile) => statsMap.has(profile.id))
      .map((profile) => ({
        ...profile,
        promptCount: statsMap.get(profile.id)!.count,
        totalSaves: statsMap.get(profile.id)!.saves,
      }))
      .sort((a, b) => b.totalSaves - a.totalSaves)
      .slice(0, limit);

    return result;
  } catch {
    return [];
  }
}

// ============================================
// CREATOR DETAILED STATS
// ============================================

/** Returns detailed stats for a creator's dashboard. */
export async function getCreatorDetailedStats(
  userId: string
): Promise<{
  totalPrompts: number;
  publishedCount: number;
  draftCount: number;
  totalSaves: number;
  totalLikes: number;
  topPrompt: DbPrompt | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("created_by", userId)
      .order("saves_count", { ascending: false });

    if (error || !data) {
      return { totalPrompts: 0, publishedCount: 0, draftCount: 0, totalSaves: 0, totalLikes: 0, topPrompt: null };
    }

    const published = data.filter((p) => p.is_published);
    const drafts = data.filter((p) => !p.is_published);

    return {
      totalPrompts: data.length,
      publishedCount: published.length,
      draftCount: drafts.length,
      totalSaves: published.reduce((sum, p) => sum + (p.saves_count ?? 0), 0),
      totalLikes: published.reduce((sum, p) => sum + (p.likes_count ?? 0), 0),
      topPrompt: published.length > 0 ? published[0] : null,
    };
  } catch {
    return { totalPrompts: 0, publishedCount: 0, draftCount: 0, totalSaves: 0, totalLikes: 0, topPrompt: null };
  }
}

// ============================================
// COMMENTS
// ============================================

/** Returns comments for a prompt with author info, nested by parent. */
export async function getCommentsByPromptId(
  promptId: string
): Promise<CommentWithAuthor[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_comments")
      .select("*, profiles!prompt_comments_user_id_fkey(display_name, avatar_url, username)")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments: CommentWithAuthor[] = (data as any[]).map((c) => ({
      id: c.id,
      prompt_id: c.prompt_id,
      user_id: c.user_id,
      content: c.is_deleted ? "[deleted]" : c.content,
      parent_id: c.parent_id,
      is_deleted: c.is_deleted,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: {
        display_name: c.profiles?.display_name ?? null,
        avatar_url: c.profiles?.avatar_url ?? null,
        username: c.profiles?.username ?? null,
      },
      replies: [],
    }));

    // Nest replies under parents
    const topLevel: CommentWithAuthor[] = [];
    const byId = new Map<string, CommentWithAuthor>();
    for (const c of comments) {
      byId.set(c.id, c);
    }
    for (const c of comments) {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies!.push(c);
      } else {
        topLevel.push(c);
      }
    }

    return topLevel;
  } catch {
    return [];
  }
}

// ============================================
// ZAP BALANCES & TRANSACTIONS
// ============================================

/** Returns a user's Zap balance, or null if no row exists. */
export async function getZapBalance(userId: string): Promise<ZapBalance | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("zap_balances")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns Zap transactions for a user, ordered by most recent. */
export async function getZapTransactions(
  userId: string,
  limit: number = 50
): Promise<ZapTransaction[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("zap_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns active Zap packages ordered by sort_order. */
export async function getZapPackages(): Promise<ZapPackage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("zap_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns all purchases for a user. */
export async function getUserPurchases(userId: string): Promise<UserPurchase[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns prompt IDs that a user has purchased. */
export async function getUserPurchasedPromptIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("prompt_id")
      .eq("user_id", userId)
      .not("prompt_id", "is", null);

    if (error) return [];
    return (data ?? []).map((p) => p.prompt_id).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

/** Returns pack IDs that a user has purchased. */
export async function getUserPurchasedPackIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("pack_id")
      .eq("user_id", userId)
      .not("pack_id", "is", null);

    if (error) return [];
    return (data ?? []).map((p) => p.pack_id).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

/** Returns chain IDs that a user has purchased. */
export async function getUserPurchasedChainIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("chain_id")
      .eq("user_id", userId)
      .not("chain_id", "is", null);

    if (error) return [];
    return (data ?? []).map((p) => p.chain_id).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

/** Checks if a user has purchased a specific prompt. */
export async function hasUserPurchasedPrompt(
  userId: string,
  promptId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("prompt_id", promptId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/** Checks if a user has purchased a specific pack. */
export async function hasUserPurchasedPack(
  userId: string,
  packId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("pack_id", packId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

// ============================================
// PROMPT PACKS
// ============================================

/** Returns all published packs. */
export async function getPublishedPacks(limit?: number): Promise<PromptPack[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("prompt_packs")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns a pack by slug, or null if not found. */
export async function getPackBySlug(slug: string): Promise<PromptPack | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_packs")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns a pack by ID, or null if not found. */
export async function getPackById(id: string): Promise<PromptPack | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_packs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns the prompts in a pack (the actual DbPrompt objects). */
export async function getPackItems(packId: string): Promise<DbPrompt[]> {
  try {
    const supabase = await createClient();
    const { data: items, error: itemsError } = await supabase
      .from("prompt_pack_items")
      .select("prompt_id")
      .eq("pack_id", packId)
      .order("sort_order");

    if (itemsError || !items || items.length === 0) return [];

    const promptIds = items.map((item) => item.prompt_id);
    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds);

    if (promptsError) return [];

    // Maintain sort order from pack items
    const promptMap = new Map((prompts ?? []).map((p) => [p.id, p]));
    return promptIds.map((id) => promptMap.get(id)).filter(Boolean) as DbPrompt[];
  } catch {
    return [];
  }
}

/** Returns packs created by a specific creator. */
export async function getPacksByCreator(creatorId: string): Promise<PromptPack[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_packs")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Creates a Zap balance row if one does not exist. */
export async function ensureZapBalance(userId: string): Promise<void> {
  try {
    const supabase = await createClient();
    // Check if balance exists first
    const { data: existing } = await supabase
      .from("zap_balances")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      // New user — grant 100 welcome Zaps
      await supabase
        .from("zap_balances")
        .insert({ user_id: userId, balance: 100, total_earned: 0, total_spent: 0 });

      await supabase
        .from("zap_transactions")
        .insert({
          user_id: userId,
          type: "purchase",
          amount: 100,
          description: "Welcome bonus — 100 free Zaps",
          reference_type: "manual",
          reference_id: "welcome-bonus",
        });
    }
  } catch {
    // Row already exists or insert failed — either way, no-op
  }
}

// ============================================
// PROMPT CHAINS
// ============================================

/** Returns all published chains ordered by saves descending. */
export async function getPublishedChains(limit?: number): Promise<DbChain[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("prompt_chains")
      .select("*")
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns a single published chain by slug, or null if not found. */
export async function getChainBySlug(slug: string): Promise<DbChain | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_chains")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns a single chain by ID, or null if not found. */
export async function getChainById(id: string): Promise<DbChain | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_chains")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Returns chain steps with full prompt data, ordered by step_number. */
export async function getChainSteps(chainId: string): Promise<ChainStepWithPrompt[]> {
  try {
    const supabase = await createClient();
    const { data: steps, error: stepsError } = await supabase
      .from("prompt_chain_steps")
      .select("*")
      .eq("chain_id", chainId)
      .order("step_number");

    if (stepsError || !steps || steps.length === 0) return [];

    const promptIds = steps.map((s) => s.prompt_id);
    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds);

    if (promptsError) return [];

    const promptMap = new Map((prompts ?? []).map((p) => [p.id, p]));
    return steps
      .map((step) => {
        const prompt = promptMap.get(step.prompt_id);
        if (!prompt) return null;
        return { ...step, prompt } as ChainStepWithPrompt;
      })
      .filter(Boolean) as ChainStepWithPrompt[];
  } catch {
    return [];
  }
}

/** Returns all chains created by a specific user. */
export async function getChainsByCreator(creatorId: string): Promise<DbChain[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompt_chains")
      .select("*")
      .eq("created_by", creatorId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns published chains for a category. */
export async function getChainsByCategory(categorySlug: string, limit?: number): Promise<DbChain[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("prompt_chains")
      .select("*")
      .eq("category_slug", categorySlug)
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Returns an array of chain IDs saved by a user. */
export async function getUserSavedChainIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_chains")
      .select("chain_id")
      .eq("user_id", userId);

    if (error) return [];
    return (data ?? []).map((s) => s.chain_id);
  } catch {
    return [];
  }
}

/** Returns all chain IDs that a user has voted on, with their vote types. */
export async function getUserChainVotes(userId: string): Promise<Record<string, "like" | "dislike">> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chain_votes")
      .select("chain_id, vote_type")
      .eq("user_id", userId);

    if (error) return {};

    const votes: Record<string, "like" | "dislike"> = {};
    for (const row of data ?? []) {
      votes[row.chain_id] = row.vote_type;
    }
    return votes;
  } catch {
    return {};
  }
}

/** Checks if a user has purchased a specific chain. */
export async function hasUserPurchasedChain(
  userId: string,
  chainId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("chain_id", chainId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/** Returns comments for a chain with author info, nested by parent. */
export async function getChainComments(chainId: string): Promise<ChainCommentWithAuthor[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chain_comments")
      .select("*, profiles!chain_comments_user_id_fkey(display_name, avatar_url, username)")
      .eq("chain_id", chainId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments: ChainCommentWithAuthor[] = (data as any[]).map((c) => ({
      id: c.id,
      chain_id: c.chain_id,
      user_id: c.user_id,
      content: c.is_deleted ? "[deleted]" : c.content,
      parent_id: c.parent_id,
      is_deleted: c.is_deleted,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: {
        display_name: c.profiles?.display_name ?? null,
        avatar_url: c.profiles?.avatar_url ?? null,
        username: c.profiles?.username ?? null,
      },
      replies: [],
    }));

    // Nest replies under parents
    const topLevel: ChainCommentWithAuthor[] = [];
    const byId = new Map<string, ChainCommentWithAuthor>();
    for (const c of comments) {
      byId.set(c.id, c);
    }
    for (const c of comments) {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies!.push(c);
      } else {
        topLevel.push(c);
      }
    }

    return topLevel;
  } catch {
    return [];
  }
}

/** Returns the count of steps in a chain. */
export async function getChainStepCount(chainId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("prompt_chain_steps")
      .select("*", { count: "exact", head: true })
      .eq("chain_id", chainId);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Credits Zaps to a user's balance and logs a transaction. */
export async function creditZaps(
  userId: string,
  amount: number,
  description: string,
  refType: string,
  refId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Ensure balance row exists
    await ensureZapBalance(userId);

    // Credit balance
    const { data: current } = await supabase
      .from("zap_balances")
      .select("balance, total_earned")
      .eq("user_id", userId)
      .single();

    if (current) {
      await supabase
        .from("zap_balances")
        .update({
          balance: current.balance + amount,
          total_earned: current.total_earned + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    // Log transaction
    await supabase.from("zap_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount,
      description,
      reference_type: refType,
      reference_id: refId,
    });
  } catch {
    console.error("Error crediting Zaps");
  }
}
