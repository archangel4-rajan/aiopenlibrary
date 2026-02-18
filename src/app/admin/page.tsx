import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Shield } from "lucide-react";
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
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-stone-600" />
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-stone-500">
                Manage prompts and content
              </p>
            </div>
          </div>
          <Link
            href="/admin/prompts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            New Prompt
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Total Prompts</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">
              {prompts.length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Published</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {prompts.filter((p) => p.is_published).length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Drafts</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {prompts.filter((p) => !p.is_published).length}
            </p>
          </div>
        </div>

        {/* Prompts Table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="px-4 py-3 text-left font-semibold text-stone-600">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 sm:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-stone-600 md:table-cell">
                  Model
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-stone-600">
                  Saves
                </th>
                <th className="px-4 py-3 text-right font-semibold text-stone-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  className="border-t border-stone-100 hover:bg-stone-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/prompts/${prompt.slug}`}
                      className="font-medium text-stone-900 hover:text-stone-600"
                    >
                      {prompt.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 sm:table-cell">
                    {prompt.category_name}
                  </td>
                  <td className="hidden px-4 py-3 text-stone-500 md:table-cell">
                    {prompt.recommended_model}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {prompt.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <Eye className="h-3 w-3" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500">
                    {prompt.saves_count}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/prompts/${prompt.id}/edit`}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
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
