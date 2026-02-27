/**
 * POST /api/chains/[slug]/purchase — purchase a premium chain with Zaps.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChainBySlug } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chain = await getChainBySlug(slug);
  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  if (!chain.is_premium || !chain.zap_price || chain.zap_price <= 0) {
    return NextResponse.json({ error: "Chain is not available for purchase" }, { status: 400 });
  }

  if (!chain.created_by) {
    return NextResponse.json({ error: "Chain has no creator" }, { status: 400 });
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("chain_id", chain.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  // Check balance
  const { data: balance } = await supabase
    .from("zap_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const currentBalance = balance?.balance ?? 0;
  if (currentBalance < chain.zap_price) {
    return NextResponse.json(
      {
        error: "Insufficient Zaps",
        balance: currentBalance,
        required: chain.zap_price,
      },
      { status: 402 }
    );
  }

  // Call the purchase_chain RPC function (atomic transaction)
  const platformCut = Math.floor(chain.zap_price * 0.2); // 20% platform cut
  const { data: result, error: rpcError } = await supabase.rpc("purchase_chain", {
    p_buyer_id: user.id,
    p_chain_id: chain.id,
    p_creator_id: chain.created_by,
    p_zap_price: chain.zap_price,
    p_platform_cut: platformCut,
  });

  if (rpcError) {
    console.error("Purchase chain RPC error:", rpcError);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, transaction_id: result });
}
