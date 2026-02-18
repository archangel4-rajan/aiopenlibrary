import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getPromptById, getCategories } from "@/lib/db";
import PromptForm from "@/components/PromptForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Prompt - Admin - AIOpenLibrary",
};

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) {
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

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-stone-900">
          Edit: {prompt.title}
        </h1>

        <PromptForm prompt={prompt} categories={categories} mode="edit" />
      </div>
    </div>
  );
}
