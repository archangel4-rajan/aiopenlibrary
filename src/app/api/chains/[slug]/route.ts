/**
 * GET /api/chains/[slug] — get a chain with its steps.
 * For premium chains where user hasn't purchased: omit full prompt text.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChainBySlug, getChainSteps, hasUserPurchasedChain } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const chain = await getChainBySlug(slug);

    if (!chain) {
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get creator profile
    let creator = null;
    if (chain.created_by) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("id", chain.created_by)
        .single();
      creator = profile;
    }

    // Get steps with prompts
    const steps = await getChainSteps(chain.id);

    // Check purchase status for premium chains
    const isPurchased =
      user && chain.is_premium
        ? await hasUserPurchasedChain(user.id, chain.id)
        : false;

    // If premium and not purchased, omit full prompt text
    const sanitizedSteps = steps.map((step) => {
      if (chain.is_premium && !isPurchased && (!user || user.id !== chain.created_by)) {
        return {
          ...step,
          prompt: {
            ...step.prompt,
            prompt: "", // Hide full prompt text
          },
        };
      }
      return step;
    });

    return NextResponse.json({
      ...chain,
      steps: sanitizedSteps,
      creator,
      isPurchased,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chain" },
      { status: 500 }
    );
  }
}
