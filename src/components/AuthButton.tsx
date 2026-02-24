"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Library, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    // Full page reload to clear all cached auth state
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
      >
        Sign In
      </Link>
    );
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
            {initials}
          </div>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-stone-200 bg-stone-50 py-2 shadow-lg shadow-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:shadow-none">
          <div className="border-b border-stone-100 px-4 pb-2 dark:border-stone-700">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{displayName}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
            >
              <Library className="h-4 w-4" />
              Your Library
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-stone-100 pt-1 dark:border-stone-700">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-100"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
