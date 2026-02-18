"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function AdminDeleteButton({
  promptId,
}: {
  promptId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete prompt");
      }
    } catch {
      alert("Failed to delete prompt");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
