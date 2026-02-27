import { redirect, notFound } from "next/navigation";
import { isCreator, getUser } from "@/lib/auth";
import { getChainById, getChainSteps, getPromptsByCreator, getCategories } from "@/lib/db";
import ChainForm from "@/components/ChainForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Chain - AIOpenLibrary",
};

export default async function EditChainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const creator = await isCreator();
  if (!creator) {
    redirect("/");
  }

  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  const { id } = await params;
  const chain = await getChainById(id);

  if (!chain) {
    notFound();
  }

  // Ownership check (unless admin)
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && chain.created_by !== user.id) {
    redirect("/creator");
  }

  const [steps, creatorPrompts, categories] = await Promise.all([
    getChainSteps(chain.id),
    getPromptsByCreator(user.id),
    getCategories(),
  ]);

  // Convert ChainStepWithPrompt to DbChainStep for the form
  const stepData = steps.map((s) => ({
    id: s.id,
    chain_id: s.chain_id,
    prompt_id: s.prompt_id,
    step_number: s.step_number,
    title_override: s.title_override,
    input_instructions: s.input_instructions,
    context_note: s.context_note,
    estimated_minutes: s.estimated_minutes,
  }));

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <ChainForm
        chain={chain}
        steps={stepData}
        creatorPrompts={creatorPrompts}
        categories={categories}
      />
    </div>
  );
}
