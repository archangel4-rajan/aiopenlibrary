import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPackById, getPackItems, ensureZapBalance } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param: packId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get pack
  const pack = await getPackById(packId);
  if (!pack || !pack.is_published) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("pack_id", packId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  // Ensure balance row exists
  await ensureZapBalance(user.id);

  // Check balance
  const { data: balance } = await supabase
    .from("zap_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const currentBalance = balance?.balance ?? 0;
  if (currentBalance < pack.zap_price) {
    return NextResponse.json(
      {
        error: "Insufficient Zaps",
        balance: currentBalance,
        required: pack.zap_price,
      },
      { status: 402 }
    );
  }

  // Get all prompts in the pack
  const prompts = await getPackItems(packId);

  const platformCut = Math.floor(pack.zap_price * 0.2);
  const creatorEarning = pack.zap_price - platformCut;

  // Deduct from buyer
  await supabase
    .from("zap_balances")
    .update({
      balance: currentBalance - pack.zap_price,
      total_spent: ((balance as Record<string, number> | null)?.total_spent ?? 0) + pack.zap_price,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  // Credit to creator
  await ensureZapBalance(pack.creator_id);
  const { data: creatorBalance } = await supabase
    .from("zap_balances")
    .select("balance, total_earned")
    .eq("user_id", pack.creator_id)
    .single();

  if (creatorBalance) {
    await supabase
      .from("zap_balances")
      .update({
        balance: creatorBalance.balance + creatorEarning,
        total_earned: creatorBalance.total_earned + creatorEarning,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", pack.creator_id);
  }

  // Log transaction for buyer
  const { data: txn } = await supabase
    .from("zap_transactions")
    .insert({
      user_id: user.id,
      type: "spend",
      amount: -pack.zap_price,
      description: `Purchased pack: ${pack.name}`,
      reference_type: "pack_purchase",
      reference_id: packId,
    })
    .select("id")
    .single();

  // Log transaction for creator
  await supabase.from("zap_transactions").insert({
    user_id: pack.creator_id,
    type: "earn",
    amount: creatorEarning,
    description: `Pack sale: ${pack.name}`,
    reference_type: "pack_sale",
    reference_id: packId,
  });

  // Create purchase record for the pack
  await supabase.from("user_purchases").insert({
    user_id: user.id,
    pack_id: packId,
    zap_amount: pack.zap_price,
    transaction_id: txn?.id ?? null,
  });

  // Create purchase records for each prompt in the pack (skip if already individually purchased)
  for (const prompt of prompts) {
    await supabase
      .from("user_purchases")
      .insert({
        user_id: user.id,
        prompt_id: prompt.id,
        pack_id: packId,
        zap_amount: 0, // Purchased as part of pack
        transaction_id: txn?.id ?? null,
      })
      .select()
      .maybeSingle(); // Using maybeSingle to gracefully handle unique constraint violations
  }

  return NextResponse.json({ success: true, transaction_id: txn?.id ?? null });
}
