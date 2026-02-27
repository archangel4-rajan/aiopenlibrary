"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function ChainDeleteButton({
  chainId,
}: {
  chainId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chain?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/creator/chains/${chainId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete chain");
      }
    } catch {
      alert("Failed to delete chain");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:text-stone-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
