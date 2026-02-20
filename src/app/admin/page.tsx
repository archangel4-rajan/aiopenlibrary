import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff, Shield, Inbox } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getAllPromptsAdmin } from "@/lib/db";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - AIOpenLibrary",
};

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  const prompts = await getAllPromptsAdmin();

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-stone-600 dark:text-stone-400" />
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Admin Dashboard
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Manage prompts and content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <Inbox className="h-4 w-4" />
              Submissions
            </Link>
            <Link
              href="/admin/prompts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              <Plus className="h-4 w-4" />
              New Prompt
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Total Prompts</p>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {prompts.length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Published</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {prompts.filter((p) => p.is_published).length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">Drafts</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {prompts.filter((p) => !p.is_published).length}
            </p>
          </div>
        </div>

        {/* Prompts Table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-900">
                <th className="px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400 sm:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 dark:text-stone-400 md:table-cell">
                  Model
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600 dark:text-stone-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600 dark:text-stone-400">
                  Saves
                </th>
                <th className="px-4 py-3 text-right font-semibold text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  className="border-t border-stone-100 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/prompts/${prompt.slug}`}
                      className="font-medium text-stone-900 hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-400"
                    >
                      {prompt.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 dark:text-stone-400 sm:table-cell">
                    {prompt.category_name}
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 dark:text-stone-400 md:table-cell">
                    {prompt.recommended_model}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {prompt.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <Eye className="h-3 w-3" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500 dark:text-stone-400">
                    {prompt.saves_count}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/prompts/${prompt.id}/edit`}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <AdminDeleteButton promptId={prompt.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
