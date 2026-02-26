import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getZapTransactions } from "@/lib/db";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);

  const transactions = await getZapTransactions(user.id, limit);
  return NextResponse.json(transactions);
}
