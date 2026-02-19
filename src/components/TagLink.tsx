import Link from "next/link";
import { Tag } from "lucide-react";

interface TagLinkProps {
  tag: string;
  /** When true, shows the Tag icon before the text */
  showIcon?: boolean;
  size?: "sm" | "md";
}

export default function TagLink({ tag, showIcon = false, size = "sm" }: TagLinkProps) {
  const sizeClasses =
    size === "sm"
      ? "rounded bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500 hover:bg-stone-200 hover:text-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300"
      : "inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-200 hover:text-stone-800 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300";

  return (
    <Link
      href={`/search?q=${encodeURIComponent(tag)}`}
      className={`inline-flex items-center gap-1 transition-colors ${sizeClasses}`}
      onClick={(e) => e.stopPropagation()}
    >
      {showIcon && <Tag className="h-3 w-3" />}
      {tag}
    </Link>
  );
}
