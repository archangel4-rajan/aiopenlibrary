import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const newsletterLimiter = createRateLimiter("newsletter", 60_000, 10);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!newsletterLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? (body as { email: unknown }).email
      : null;

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  // Try to get the current user (optional)
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Not authenticated
  }

  const admin = createAdminClient();

  // Check if already exists
  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    if (existing.status === "active") {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      });
    }

    // Reactivate
    await admin
      .from("newsletter_subscribers")
      .update({
        status: "active",
        unsubscribed_at: null,
        user_id: userId,
      })
      .eq("id", existing.id);

    return NextResponse.json({
      success: true,
      message: "Welcome back! You've been re-subscribed.",
    });
  }

  // New subscriber
  const { error } = await admin.from("newsletter_subscribers").insert({
    email: email.toLowerCase(),
    user_id: userId,
    source: "website",
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "You're subscribed! Welcome aboard.",
  });
}
