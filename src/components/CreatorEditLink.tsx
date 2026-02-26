"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function CreatorEditLink({
  promptId,
  createdBy,
}: {
  promptId: string;
  createdBy: string | null;
}) {
  const { user } = useAuth();

  if (!user || !createdBy || user.id !== createdBy) return null;

  return (
    <Link
      href={`/creator/prompts/${promptId}/edit`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
    >
      <Edit className="h-3.5 w-3.5" />
      Edit
    </Link>
  );
}
