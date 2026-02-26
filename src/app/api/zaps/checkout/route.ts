import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { packageId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.packageId) {
    return NextResponse.json({ error: "packageId is required" }, { status: 400 });
  }

  // Validate package exists and is active
  const { data: pkg, error: pkgError } = await supabase
    .from("zap_packages")
    .select("*")
    .eq("id", body.packageId)
    .eq("is_active", true)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments not configured yet" },
      { status: 503 }
    );
  }

  try {
    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const origin = request.headers.get("origin") || "https://aiopenlibrary.com";

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pkg.name} — ${pkg.zap_amount} Zaps`,
              description: `${pkg.zap_amount} Zaps for AIOpenLibrary`,
            },
            unit_amount: pkg.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/zaps/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/zaps`,
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        zap_amount: String(pkg.zap_amount),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
