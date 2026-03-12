import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPurchasedPromptIds, getUserPurchasedPackIds } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [promptIds, packIds] = await Promise.all([
      getUserPurchasedPromptIds(user.id),
      getUserPurchasedPackIds(user.id),
    ]);

    return NextResponse.json({ promptIds, packIds });
  } catch (err) {
    console.error("GET /api/user/purchases error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
