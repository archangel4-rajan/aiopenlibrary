import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPackById, ensureZapBalance } from "@/lib/db";

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

  const pack = await getPackById(packId);
  if (!pack || !pack.is_published) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Prevent self-purchase
  if (pack.creator_id === user.id) {
    return NextResponse.json({ error: "You cannot purchase your own pack" }, { status: 400 });
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

  // Call atomic RPC (p_platform_cut is a percentage: 20 = 20%)
  const { data: result, error: rpcError } = await supabase.rpc("purchase_pack", {
    p_buyer_id: user.id,
    p_pack_id: packId,
    p_creator_id: pack.creator_id,
    p_zap_price: pack.zap_price,
    p_platform_cut: 20,
  });

  if (rpcError) {
    console.error("Purchase pack RPC error:", rpcError);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, transaction_id: result });
}
