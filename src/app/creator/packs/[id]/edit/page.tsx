import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isCreator, getUser } from "@/lib/auth";
import { getPromptsByCreator, getPackById } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import PackForm from "@/components/PackForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Pack - AIOpenLibrary",
};

export default async function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = await isCreator();
  if (!creator) {
    redirect("/");
  }

  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  const pack = await getPackById(id);
  if (!pack || pack.creator_id !== user.id) {
    notFound();
  }

  // Get pack's current prompt IDs
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("prompt_pack_items")
    .select("prompt_id")
    .eq("pack_id", id)
    .order("sort_order");

  const promptIds = (items ?? []).map((item) => item.prompt_id);

  const prompts = await getPromptsByCreator(user.id);
  const publishedPrompts = prompts.filter((p) => p.is_published);

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/creator"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Edit Pack
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Update your prompt pack.
          </p>
        </div>

        <PackForm
          pack={{ ...pack, prompt_ids: promptIds }}
          creatorPrompts={publishedPrompts}
        />
      </div>
    </div>
  );
}
