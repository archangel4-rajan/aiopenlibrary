import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: promptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate prompt exists and is premium with a price
  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .select("id, is_premium, zap_price, created_by")
    .eq("id", promptId)
    .single();

  if (promptError || !prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  if (!prompt.is_premium || !prompt.zap_price || prompt.zap_price <= 0) {
    return NextResponse.json({ error: "Prompt is not available for purchase" }, { status: 400 });
  }

  if (!prompt.created_by) {
    return NextResponse.json({ error: "Prompt has no creator" }, { status: 400 });
  }

  // Prevent self-purchase (creator buying own prompt)
  if (prompt.created_by === user.id) {
    return NextResponse.json({ error: "You cannot purchase your own prompt" }, { status: 400 });
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("prompt_id", promptId)
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
  if (currentBalance < prompt.zap_price) {
    return NextResponse.json(
      {
        error: "Insufficient Zaps",
        balance: currentBalance,
        required: prompt.zap_price,
      },
      { status: 402 }
    );
  }

  // Call the purchase_prompt RPC function (atomic transaction)
  // p_platform_cut is a percentage (20 = 20%)
  const { data: result, error: rpcError } = await supabase.rpc("purchase_prompt", {
    p_buyer_id: user.id,
    p_prompt_id: promptId,
    p_creator_id: prompt.created_by,
    p_zap_price: prompt.zap_price,
    p_platform_cut: 20,
  });

  if (rpcError) {
    console.error("Purchase RPC error:", rpcError);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, transaction_id: result });
}
