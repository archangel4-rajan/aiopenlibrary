import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isCreator } from "@/lib/auth";
import { getCategories } from "@/lib/db";
import PromptForm from "@/components/PromptForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Prompt - Creator - AIOpenLibrary",
};

export default async function CreatorNewPromptPage() {
  const creator = await isCreator();
  if (!creator) {
    redirect("/");
  }

  const categories = await getCategories();

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
          Create New Prompt
        </h1>

        <PromptForm
          categories={categories}
          mode="create"
          apiBase="/api/creator/prompts"
          backUrl="/creator"
        />
      </div>
    </div>
  );
}
