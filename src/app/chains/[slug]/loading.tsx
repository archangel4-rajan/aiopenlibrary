export default function ChainDetailLoading() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb placeholder */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-4 text-stone-300 dark:text-stone-700">/</div>
          <div className="h-4 w-14 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-4 text-stone-300 dark:text-stone-700">/</div>
          <div className="h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Back link placeholder */}
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

        {/* Header */}
        <div className="mb-8 mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              {/* Title */}
              <div className="h-9 w-72 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              {/* Creator */}
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              {/* Description */}
              <div className="mt-3 max-w-2xl space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex shrink-0 gap-2">
              <div className="h-9 w-20 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="h-6 w-20 animate-pulse rounded-md bg-stone-200 dark:bg-stone-800" />
            <div className="h-6 w-20 animate-pulse rounded-md bg-stone-200 dark:bg-stone-800" />
            <div className="h-6 w-24 animate-pulse rounded-md bg-stone-200 dark:bg-stone-800" />
            <div className="h-6 w-20 animate-pulse rounded-md bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Tags placeholder */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            <div className="h-5 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-5 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-5 w-14 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* CTA button placeholder */}
          <div className="mt-6">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Share buttons placeholder */}
          <div className="mt-6 flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-8 w-8 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-8 w-8 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>

        {/* Chain Steps Timeline */}
        <div className="mb-12">
          <div className="mb-6 h-7 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

          <div className="space-y-0">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
                  {step < 4 && (
                    <div className="w-0.5 flex-1 bg-stone-200 dark:bg-stone-800" />
                  )}
                </div>
                {/* Step content */}
                <div className="flex-1 pb-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
                    <div className="h-5 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments section placeholder */}
        <div className="border-t border-stone-200 pt-8 dark:border-stone-700">
          <div className="h-7 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mt-4 space-y-4">
            <div className="h-20 w-full animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
