/**
 * Authentication helpers for AIOpenLibrary.
 *
 * Wraps Supabase auth to provide typed user and profile access.
 */

import { createClient } from "@/lib/supabase/server";
import type { DbProfile } from "@/lib/types";

/** Returns the currently authenticated Supabase user, or null. */
export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** Returns the profile for the currently authenticated user, or null. */
export async function getProfile(): Promise<DbProfile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

/** Returns true if the currently authenticated user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === "admin";
}

/** Returns true if the currently authenticated user is a creator or admin. */
export async function isCreator(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === "creator" || profile?.role === "admin";
}
