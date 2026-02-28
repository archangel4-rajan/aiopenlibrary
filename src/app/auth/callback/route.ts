import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  // Sanitize redirect target — only allow relative paths (prevent open redirect)
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  // Handle explicit errors from Supabase
  if (error) {
    const message = errorDescription || error;
    console.error("[auth/callback] OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(message)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("[auth/callback] Code exchange failed:", exchangeError.message);

        // Common mobile issue: code already used (user hit back button or double-tapped)
        if (exchangeError.message.includes("code") && exchangeError.message.includes("already")) {
          // Try to check if session exists anyway
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Session is valid, redirect normally
            return NextResponse.redirect(`${origin}${next}`);
          }
        }

        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      // Grant 100 free Zaps to new users (first login only)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existingBalance } = await supabase
            .from("zap_balances")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingBalance) {
            await supabase
              .from("zap_balances")
              .insert({ user_id: user.id, balance: 100, total_earned: 0, total_spent: 0 });

            await supabase
              .from("zap_transactions")
              .insert({
                user_id: user.id,
                type: "purchase",
                amount: 100,
                description: "Welcome bonus — 100 free Zaps",
                reference_type: "manual",
                reference_id: "welcome-bonus",
              });
          }
        }
      } catch (zapErr) {
        // Non-blocking — don't fail auth if Zap grant fails
        console.error("[auth/callback] Zap welcome bonus error:", zapErr);
      }

      // If this was a password reset, redirect to the reset page
      const type = searchParams.get("type");
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      const response = NextResponse.redirect(`${origin}${next}`);

      // Ensure cookies are set with proper attributes for mobile browsers
      // The supabase client should handle this, but we ensure the response
      // has the right cache headers to prevent stale auth state
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      response.headers.set("Pragma", "no-cache");

      return response;
    } catch (err) {
      console.error("[auth/callback] Unexpected error:", err);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
      );
    }
  }

  // No code and no error — invalid callback
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
  );
}
