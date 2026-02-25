"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Trophy, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import AuthButton from "./AuthButton";
import { useAuth } from "./AuthProvider";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/categories") {
      return pathname.startsWith("/categories") || pathname.startsWith("/category/");
    }
    if (href === "/leaderboard") {
      return pathname.startsWith("/leaderboard");
    }
    if (href === "/profile") {
      return pathname.startsWith("/profile");
    }
    if (href === "/admin") {
      return pathname.startsWith("/admin");
    }
    return false;
  };

  const getLinkClassName = (href: string): string => {
    const baseClass = "text-[15px] transition-colors";
    const activeClass = "text-stone-900 font-medium dark:text-stone-100";
    const inactiveClass = "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100";
    return `${baseClass} ${isActive(href) ? activeClass : inactiveClass}`;
  };

  const getMobileMenuItemClassName = (href: string): string => {
    const baseClass = "rounded-lg px-3 py-2.5 text-[15px] transition-colors";
    const activeClass = "text-stone-900 font-medium dark:text-stone-100 bg-stone-100 dark:bg-stone-800";
    const inactiveClass = "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100";
    return `${baseClass} ${isActive(href) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-24">
          <div className="flex items-center gap-5 sm:gap-10">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Logo size={76} className="h-11 w-11 sm:h-[76px] sm:w-[76px]" />
              <span className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:text-[32px]">
                AIOpenLibrary
              </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              <Link
                href="/"
                className={getLinkClassName("/")}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className={getLinkClassName("/categories")}
              >
                Categories
              </Link>
              <Link
                href="/leaderboard"
                className={`${getLinkClassName("/leaderboard")} flex items-center gap-1.5`}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className={`${getLinkClassName("/profile")} flex items-center gap-1.5`}
                >
                  <Library className="h-4 w-4" />
                  Your Library
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={getLinkClassName("/admin")}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2 text-[15px] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-500 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-200 dark:focus:ring-stone-800 sm:w-72"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2 text-[15px] text-stone-400 dark:text-stone-500 transition-colors hover:border-stone-300 dark:hover:border-stone-600 hover:text-stone-600 dark:hover:text-stone-400"
              >
                <Search className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 font-mono text-[11px] text-stone-400 dark:text-stone-500 sm:inline">
                  /
                </kbd>
              </button>
            )}

            <ThemeToggle />

            <AuthButton />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2.5 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-stone-100 dark:border-stone-700 py-4 md:hidden dark:bg-stone-950/50">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className={getMobileMenuItemClassName("/")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className={getMobileMenuItemClassName("/categories")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/leaderboard"
                className={`${getMobileMenuItemClassName("/leaderboard")} flex items-center gap-1.5`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-3.5 w-3.5" />
                Leaderboard
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className={`${getMobileMenuItemClassName("/profile")} flex items-center gap-1.5`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Library className="h-3.5 w-3.5" />
                  Your Library
                </Link>
              )}
              <Link
                href="/about"
                className={getMobileMenuItemClassName("/about")}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={getMobileMenuItemClassName("/admin")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
