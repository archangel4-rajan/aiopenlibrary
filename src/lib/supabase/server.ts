/**
 * Server-side Supabase client for AIOpenLibrary.
 *
 * Uses the @supabase/ssr package to create a client that reads/writes
 * cookies via Next.js `cookies()` for session management.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * User-scoped client — respects RLS based on the logged-in user's session.
 * Use for user-specific operations (saves, votes, profile updates).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                // Ensure cookies work on mobile browsers (Safari ITP, Chrome)
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
              })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Admin client — bypasses RLS entirely using the service role key.
 * Use for public data queries where RLS would incorrectly restrict results
 * (e.g., reading prompts with creator profile joins).
 *
 * NEVER expose this client to the browser or use it for user-mutable operations.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
