import { NextResponse } from "next/server";
import { searchPromptsWithFilters } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { searchLimiter, getClientIp } from "@/lib/rate-limit";
import { trackSearch } from "@/lib/activity";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (!searchLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const difficulty = searchParams.get("difficulty") || undefined;
  const model = searchParams.get("model") || undefined;

  const results = await searchPromptsWithFilters(query, {
    category,
    difficulty,
    model,
  });

  if (query) {
    // Extract user ID if authenticated (fire-and-forget, never blocks response)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Not authenticated — track as anonymous
    }
    trackSearch(query, results.length, userId);
  }

  return NextResponse.json(results);
}
