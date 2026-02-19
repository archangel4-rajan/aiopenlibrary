export default function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
      {/* Category badge + save button area */}
      <div className="mb-3 flex items-start justify-between">
        <div className="h-6 w-28 animate-pulse rounded-md bg-stone-100 dark:bg-stone-800" />
        <div className="h-5 w-10 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>

      {/* Title */}
      <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />

      {/* Description lines */}
      <div className="mb-1 h-4 w-full animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />

      {/* Model badge */}
      <div className="mb-3 h-6 w-24 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />

      {/* Tags */}
      <div className="mb-3 flex gap-1.5">
        <div className="h-5 w-16 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-5 w-20 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-5 w-14 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
        <div className="h-5 w-20 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
        <div className="h-4 w-16 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>
    </div>
  );
}
