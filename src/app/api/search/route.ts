import { NextResponse } from "next/server";
import { searchPrompts } from "@/lib/db";
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

  const results = await searchPrompts(query);

  return NextResponse.json(results);
}
