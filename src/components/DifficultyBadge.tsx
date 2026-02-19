interface DifficultyBadgeProps {
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  size?: "sm" | "md";
}

const styles = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const sizeClass = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5";

  return (
    <span className={`rounded-full font-medium ${sizeClass} ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
