import { NextResponse } from "next/server";
import { creditZaps } from "@/lib/db";

export async function POST(request: Request) {
  // If Stripe is not configured, no-op
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const packageId = session.metadata?.package_id;
      const zapAmount = parseInt(session.metadata?.zap_amount || "0", 10);

      if (userId && zapAmount > 0) {
        await creditZaps(
          userId,
          zapAmount,
          `Purchased ${zapAmount} Zaps`,
          "stripe_checkout",
          packageId || session.id
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
