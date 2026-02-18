import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DbPrompt, DbCategory, DbProfile } from "@/lib/types";
import {
  categories as hardcodedCategories,
  prompts as hardcodedPrompts,
  type Prompt,
  type Category,
} from "@/data/prompts";

// ============================================
// FALLBACK: Convert hardcoded data to DB shape
// ============================================

function promptToDb(p: Prompt): DbPrompt {
  return {
    id: p.slug, // use slug as ID for fallback
    slug: p.slug,
    title: p.title,
    description: p.description,
    category_id: p.categorySlug,
    category_name: p.category,
    category_slug: p.categorySlug,
    prompt: p.prompt,
    tags: p.tags,
    recommended_model: p.recommendedModel,
    model_icon: p.modelIcon,
    use_cases: p.useCases,
    example_output: p.exampleOutput || null,
    output_screenshots: p.outputScreenshots || null,
    references: p.references || [],
    variables: p.variables || [],
    tips: p.tips || null,
    difficulty: p.difficulty,
    saves_count: p.saves,
    is_published: true,
    created_by: null,
    created_at: p.createdAt,
    updated_at: p.createdAt,
  };
}

function categoryToDb(c: Category): DbCategory {
  return {
    id: c.slug,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description,
    created_at: new Date().toISOString(),
  };
}

const fallbackPrompts: DbPrompt[] = hardcodedPrompts.map(promptToDb);
const fallbackCategories: DbCategory[] = hardcodedCategories.map(categoryToDb);

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(): Promise<DbCategory[]> {
  if (!isSupabaseConfigured()) return fallbackCategories;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return fallbackCategories;
    }
    return data ?? fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<DbCategory | null> {
  if (!isSupabaseConfigured()) {
    return fallbackCategories.find((c) => c.slug === slug) || null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return fallbackCategories.find((c) => c.slug === slug) || null;
    return data;
  } catch {
    return fallbackCategories.find((c) => c.slug === slug) || null;
  }
}

// ============================================
// PROMPTS
// ============================================

export async function getPrompts(): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) {
    return [...fallbackPrompts].sort((a, b) => b.saves_count - a.saves_count);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .order("saves_count", { ascending: false });

    if (error) {
      console.error("Error fetching prompts:", error);
      return fallbackPrompts;
    }
    return data ?? fallbackPrompts;
  } catch {
    return fallbackPrompts;
  }
}

export async function getPromptBySlug(
  slug: string
): Promise<DbPrompt | null> {
  if (!isSupabaseConfigured()) {
    return fallbackPrompts.find((p) => p.slug === slug) || null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) return fallbackPrompts.find((p) => p.slug === slug) || null;
    return data;
  } catch {
    return fallbackPrompts.find((p) => p.slug === slug) || null;
  }
}

export async function getPromptById(id: string): Promise<DbPrompt | null> {
  if (!isSupabaseConfigured()) {
    return fallbackPrompts.find((p) => p.id === id) || null;
  }
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

export async function getPromptsByCategory(
  categorySlug: string
): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) {
    return fallbackPrompts
      .filter((p) => p.category_slug === categorySlug)
      .sort((a, b) => b.saves_count - a.saves_count);
  }
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
      return fallbackPrompts.filter((p) => p.category_slug === categorySlug);
    }
    return data ?? [];
  } catch {
    return fallbackPrompts.filter((p) => p.category_slug === categorySlug);
  }
}

export async function getFeaturedPrompts(
  limit: number = 6
): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) {
    return [...fallbackPrompts]
      .sort((a, b) => b.saves_count - a.saves_count)
      .slice(0, limit);
  }
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
      return [...fallbackPrompts]
        .sort((a, b) => b.saves_count - a.saves_count)
        .slice(0, limit);
    }
    return data ?? [];
  } catch {
    return [...fallbackPrompts]
      .sort((a, b) => b.saves_count - a.saves_count)
      .slice(0, limit);
  }
}

export async function searchPrompts(query: string): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...fallbackPrompts].sort(
        (a, b) => b.saves_count - a.saves_count
      );
    }
    return fallbackPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  try {
    const supabase = await createClient();
    const q = query.trim();

    if (!q) {
      return getPrompts();
    }

    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("is_published", true)
      .or(
        `title.ilike.%${q}%,description.ilike.%${q}%,category_name.ilike.%${q}%`
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

export async function getPromptsCount(): Promise<number> {
  if (!isSupabaseConfigured()) return fallbackPrompts.length;
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("prompts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (error) return fallbackPrompts.length;
    return count ?? 0;
  } catch {
    return fallbackPrompts.length;
  }
}

export async function getCategoryPromptCounts(): Promise<
  Record<string, number>
> {
  if (!isSupabaseConfigured()) {
    const counts: Record<string, number> = {};
    for (const p of fallbackPrompts) {
      counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
    }
    return counts;
  }
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

export async function getAllPromptsAdmin(): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) return fallbackPrompts;
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

export async function isPromptSavedByUser(
  promptId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
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

export async function getUserSavedPrompts(
  userId: string
): Promise<DbPrompt[]> {
  if (!isSupabaseConfigured()) return [];
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

export async function getUserSavedPromptIds(
  userId: string
): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
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
// LEADERBOARD
// ============================================

export interface LeaderboardPrompt extends DbPrompt {
  weekly_saves: number;
}

export async function getLeaderboardPrompts(
  limit: number = 20
): Promise<LeaderboardPrompt[]> {
  if (!isSupabaseConfigured()) {
    // Fallback: return top prompts by saves_count with fake weekly_saves
    return [...fallbackPrompts]
      .sort((a, b) => b.saves_count - a.saves_count)
      .slice(0, limit)
      .map((p, i) => ({
        ...p,
        weekly_saves: Math.max(0, p.saves_count - i * 10),
      }));
  }
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
    return [...fallbackPrompts]
      .sort((a, b) => b.saves_count - a.saves_count)
      .slice(0, limit)
      .map((p) => ({ ...p, weekly_saves: 0 }));
  }
}

// ============================================
// PROFILES
// ============================================

export async function getUserProfile(
  userId: string
): Promise<DbProfile | null> {
  if (!isSupabaseConfigured()) return null;
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
