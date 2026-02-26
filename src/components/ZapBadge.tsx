"use client";

interface ZapBadgeProps {
  balance: number;
  size?: "sm" | "md";
}

export default function ZapBadge({ balance, size = "sm" }: ZapBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5 gap-1"
    : "text-sm px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-50 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ${sizeClasses}`}
    >
      <span>⚡</span>
      {balance.toLocaleString()}
    </span>
  );
}
