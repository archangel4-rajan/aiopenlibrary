import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureZapBalance, getZapBalance } from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureZapBalance(user.id);
  const balance = await getZapBalance(user.id);

  return NextResponse.json({
    balance: balance?.balance ?? 0,
    total_earned: balance?.total_earned ?? 0,
    total_spent: balance?.total_spent ?? 0,
  });
}
