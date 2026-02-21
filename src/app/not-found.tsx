import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <h1 className="text-6xl font-bold text-stone-300 dark:text-stone-700">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Go Home
        </Link>
        <Link
          href="/categories"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
