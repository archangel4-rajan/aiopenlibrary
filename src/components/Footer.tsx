import Link from "next/link";
import Logo from "./Logo";

const linkClass =
  "text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                AIOpenLibrary
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-400 dark:text-stone-500">
              The free AI prompt library. Find expert-crafted prompts,
              customize the variables, and get better results from any AI.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Explore
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/categories" className={linkClass}>
                All Categories
              </Link>
              <Link href="/search?q=" className={linkClass}>
                Search Prompts
              </Link>
              <Link href="/chains" className={linkClass}>
                Chains
              </Link>
              <Link href="/submit" className={linkClass}>
                Share a Prompt
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Resources
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/guides/prompt-writing" className={linkClass}>
                Prompt Writing Guide
              </Link>
              <Link href="/faq" className={linkClass}>
                FAQ
              </Link>
              <Link href="/how-it-works" className={linkClass}>
                How It Works
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Account
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/profile?tab=submissions" className={linkClass}>
                My Submissions
              </Link>
              <Link href="/profile" className={linkClass}>
                Your Library
              </Link>
              <Link href="/creator" className={linkClass}>
                Creator Dashboard
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Company
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className={linkClass}>
                About
              </Link>
              <a
                href="https://twitter.com/aiopenlibrary"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Twitter/X
              </a>
              <a
                href="https://github.com/archangel4-rajan/aiopenlibrary"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-400 dark:border-stone-700 dark:text-stone-500">
          &copy; {new Date().getFullYear()} AIOpenLibrary. Built for the AI era.
        </div>
      </div>
    </footer>
  );
}
