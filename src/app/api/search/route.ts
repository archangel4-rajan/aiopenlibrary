import { NextResponse } from "next/server";
import { searchPromptsWithFilters } from "@/lib/db";
import { searchLimiter, getClientIp } from "@/lib/rate-limit";

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

  return NextResponse.json(results);
}
