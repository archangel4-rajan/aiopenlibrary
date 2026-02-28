export default function PackDetailLoading() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Back link placeholder */}
        <div className="mb-6 h-5 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

        {/* Header */}
        <div className="mt-4 mb-8">
          {/* Title */}
          <div className="h-9 w-64 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

          {/* Creator */}
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

          {/* Description */}
          <div className="mt-3 max-w-2xl space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Price area */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-10 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <div className="h-6 w-52 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="h-4 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Purchase button placeholder */}
          <div className="mt-6">
            <div className="h-10 w-36 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>

        {/* Included Prompts */}
        <div>
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="mt-2 h-3 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-10 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
