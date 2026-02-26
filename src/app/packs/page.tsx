import type { Metadata } from "next";
import { getPublishedPacks } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import PackCard from "@/components/PackCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prompt Packs - AIOpenLibrary",
  description: "Browse curated collections of premium AI prompts from top creators.",
};

export default async function PacksPage() {
  const packs = await getPublishedPacks();

  // Enrich with creator info and prompt counts
  let enrichedPacks: Array<{
    id: string;
    name: string;
    description: string;
    slug: string;
    cover_image_url: string | null;
    zap_price: number;
    creator: { display_name: string | null; username: string | null } | null;
    prompt_count: number;
  }> = [];

  if (packs.length > 0) {
    const supabase = await createClient();

    const creatorIds = [...new Set(packs.map((p) => p.creator_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", creatorIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    );

    const packIds = packs.map((p) => p.id);
    const { data: items } = await supabase
      .from("prompt_pack_items")
      .select("pack_id")
      .in("pack_id", packIds);

    const countMap = new Map<string, number>();
    for (const item of items ?? []) {
      countMap.set(item.pack_id, (countMap.get(item.pack_id) || 0) + 1);
    }

    enrichedPacks = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      slug: pack.slug,
      cover_image_url: pack.cover_image_url,
      zap_price: pack.zap_price,
      creator: profileMap.get(pack.creator_id) ?? null,
      prompt_count: countMap.get(pack.id) ?? 0,
    }));
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Prompt Packs
          </h1>
          <p className="mt-2 text-base text-stone-500 dark:text-stone-400">
            Curated collections of premium prompts — bundled for savings.
          </p>
        </div>

        {enrichedPacks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrichedPacks.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
            <p className="text-base text-stone-400 dark:text-stone-500">
              No packs available yet.
            </p>
            <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
              Check back soon for curated prompt collections from creators.
            </p>
            <Link
              href="/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              Browse Individual Prompts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
