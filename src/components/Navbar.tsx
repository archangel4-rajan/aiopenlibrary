"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Trophy, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import { useAuth } from "./AuthProvider";
import Logo from "./Logo";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-20">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5">
              <Logo size={36} />
              <span className="text-lg font-semibold tracking-tight text-stone-900 sm:text-4xl">
                AIOpenLibrary
              </span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/"
                className="text-sm text-stone-500 transition-colors hover:text-stone-900"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="text-sm text-stone-500 transition-colors hover:text-stone-900"
              >
                Categories
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900"
              >
                <Trophy className="h-3.5 w-3.5" />
                Leaderboard
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900"
                >
                  <Library className="h-3.5 w-3.5" />
                  Your Library
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-stone-500 transition-colors hover:text-stone-900"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-200 sm:w-64"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-400 transition-colors hover:border-stone-300 hover:text-stone-600"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 sm:inline">
                  /
                </kbd>
              </button>
            )}

            <AuthButton />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-stone-100 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-3.5 w-3.5" />
                Leaderboard
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Library className="h-3.5 w-3.5" />
                  Your Library
                </Link>
              )}
              <Link
                href="/about"
                className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
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
