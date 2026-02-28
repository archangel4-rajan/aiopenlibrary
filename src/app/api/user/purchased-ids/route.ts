import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserPurchasedPromptIds } from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json([]);
    }

    const purchasedIds = await getUserPurchasedPromptIds(user.id);
    return NextResponse.json(purchasedIds);
  } catch {
    return NextResponse.json([]);
  }
}
