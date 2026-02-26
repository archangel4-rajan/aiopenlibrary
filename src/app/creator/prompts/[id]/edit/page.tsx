import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isCreator, getUser } from "@/lib/auth";
import { getPromptById, getCategories } from "@/lib/db";
import PromptForm from "@/components/PromptForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Prompt - Creator - AIOpenLibrary",
};

export default async function CreatorEditPromptPage({
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
  const [prompt, categories] = await Promise.all([
    getPromptById(id),
    getCategories(),
  ]);

  if (!prompt) {
    notFound();
  }

  // Ownership check
  if (prompt.created_by !== user.id) {
    redirect("/creator");
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/creator"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Creator Dashboard
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-stone-900 dark:text-stone-100">
          Edit: {prompt.title}
        </h1>

        <PromptForm
          prompt={prompt}
          categories={categories}
          mode="edit"
          apiBase="/api/creator/prompts"
          backUrl="/creator"
        />
      </div>
    </div>
  );
}
