import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserSavedPromptIds } from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json([]);
    }

    const savedIds = await getUserSavedPromptIds(user.id);
    return NextResponse.json(savedIds);
  } catch {
    return NextResponse.json([]);
  }
}
