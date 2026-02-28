export default function ZapsLoading() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Title section */}
        <div className="mb-8 text-center">
          <div className="mx-auto h-10 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mx-auto mt-3 h-5 w-80 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

          {/* Balance card placeholder */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-6 py-3 dark:border-stone-700 dark:bg-stone-800">
            <div className="h-8 w-8 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
            <div className="text-left">
              <div className="h-3 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
              <div className="mt-1 h-7 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
        </div>

        {/* Package grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((pkg) => (
            <div
              key={pkg}
              className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="mb-4 text-center">
                {/* Package name */}
                <div className="mx-auto h-6 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                {/* Zap amount */}
                <div className="mx-auto mt-3 h-9 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                {/* Price */}
                <div className="mx-auto mt-2 h-7 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                {/* Rate */}
                <div className="mx-auto mt-1 h-3 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              </div>
              {/* Buy button */}
              <div className="h-10 w-full animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
