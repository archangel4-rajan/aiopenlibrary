import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                AIOpenLibrary
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400 dark:text-stone-500">
              The free, open-source prompt library. Find expert-crafted prompts,
              customize the variables, and get better results from any AI.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Explore
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/categories"
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                All Categories
              </Link>
              <Link
                href="/search?q="
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Search Prompts
              </Link>
              <Link
                href="/submit"
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Share a Prompt
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Company
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                About
              </Link>
              <a
                href="https://twitter.com/aiopenlibrary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Twitter/X
              </a>
              <a
                href="https://github.com/aiopenlibrary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-400 dark:border-stone-700 dark:text-stone-500">
          &copy; {new Date().getFullYear()} AIOpenLibrary. Free and open
          source — built for the AI era.
        </div>
      </div>
    </footer>
  );
}
