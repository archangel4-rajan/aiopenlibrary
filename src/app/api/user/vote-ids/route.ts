/**
 * GET /api/user/vote-ids — returns the current user's votes as a map
 * of { prompt_id: "like" | "dislike" }.
 *
 * Unauthenticated users receive an empty object.
 */

import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserVotedPromptIds } from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({});
    }

    const votes = await getUserVotedPromptIds(user.id);
    return NextResponse.json(votes);
  } catch {
    return NextResponse.json({});
  }
}
