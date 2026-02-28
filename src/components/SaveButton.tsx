"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

interface SaveButtonProps {
  promptId: string;
  initialSaved: boolean;
  savesCount: number;
  size?: "sm" | "md";
}

export default function SaveButton({
  promptId,
  initialSaved,
  savesCount,
  size = "sm",
}: SaveButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(savesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);

    const wasSaved = saved;
    setSaved(!saved);
    setCount(saved ? count - 1 : count + 1);

    try {
      const response = await fetch(`/api/prompts/${promptId}/save`, {
        method: saved ? "DELETE" : "POST",
      });

      if (response.status === 401) {
        // Session expired — redirect to login
        setSaved(wasSaved);
        setCount(savesCount);
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        setSaved(wasSaved);
        setCount(savesCount);
      } else {
        toast({ message: wasSaved ? "Removed from library" : "Saved!", type: "success" });
      }
    } catch {
      setSaved(wasSaved);
      setCount(savesCount);
    } finally {
      setIsLoading(false);
    }
  };

  if (size === "md") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all disabled:opacity-50 ${
          saved
            ? "border-stone-400 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
            : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        }`}
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
        />
        {count} {count === 1 ? "save" : "saves"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
        saved ? "text-stone-700 dark:text-stone-200" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
      }`}
    >
      <Bookmark
        className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`}
      />
      <span className="text-xs">{count}</span>
    </button>
  );
}
