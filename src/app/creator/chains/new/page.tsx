import { redirect } from "next/navigation";
import { isCreator, getUser } from "@/lib/auth";
import { getPromptsByCreator, getCategories } from "@/lib/db";
import ChainForm from "@/components/ChainForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Chain - AIOpenLibrary",
};

export default async function NewChainPage() {
  const creator = await isCreator();
  if (!creator) {
    redirect("/");
  }

  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  const [creatorPrompts, categories] = await Promise.all([
    getPromptsByCreator(user.id),
    getCategories(),
  ]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <ChainForm creatorPrompts={creatorPrompts} categories={categories} />
    </div>
  );
}
