"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Trophy,
  Send,
  X,
  Menu,
  Library,
  PenTool,
  Shield,
  Search,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import Logo from "./Logo";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";
import ZapBalance from "./ZapBalance";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/creator/prompts/new", label: "Submit", icon: Send },
];

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, isCreator } = useAuth();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    startTransition(() => setMobileOpen(false));
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href === "/leaderboard") return pathname.startsWith("/leaderboard");
    if (href === "/creator/prompts/new") return pathname === "/creator/prompts/new";
    if (href === "/profile") return pathname.startsWith("/profile");
    if (href === "/creator")
      return pathname.startsWith("/creator") && !pathname.startsWith("/creators");
    if (href === "/admin") return pathname.startsWith("/admin");
    return false;
  };

  const isCategoryActive = (slug: string): boolean => {
    return pathname === `/category/${slug}` || pathname.startsWith(`/category/${slug}/`);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={62} className="h-[62px] w-[62px]" />
          <span className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            AIOpenLibrary
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="px-3 py-2">
        <ul className="space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(href)
                    ? "bg-stone-200/70 text-stone-900 font-medium dark:bg-stone-700/70 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <Link
                href="/profile"
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive("/profile")
                    ? "bg-stone-200/70 text-stone-900 font-medium dark:bg-stone-700/70 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Library className="h-4 w-4" />
                Your Library
              </Link>
            </li>
          )}
          {isCreator && (
            <li>
              <Link
                href="/creator"
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive("/creator")
                    ? "bg-stone-200/70 text-stone-900 font-medium dark:bg-stone-700/70 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <PenTool className="h-4 w-4" />
                My Prompts
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive("/admin")
                    ? "bg-stone-200/70 text-stone-900 font-medium dark:bg-stone-700/70 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Categories */}
      <div className="mt-2 border-t border-stone-200 dark:border-stone-700 px-3 pt-3 pb-2">
        <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Categories
        </h3>
        <ul className="max-h-[calc(100vh-480px)] space-y-0.5 overflow-y-auto scrollbar-thin">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/category/${cat.slug}`}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isCategoryActive(cat.slug)
                    ? "bg-stone-200/70 text-stone-900 font-medium dark:bg-stone-700/70 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom section: auth + theme */}
      <div className="mt-auto border-t border-stone-200 dark:border-stone-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthButton dropdownPosition="top-left" />
            {user && <ZapBalance />}
          </div>
          <ThemeToggle dropdownPosition="top-right" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col border-r border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 h-screen sticky top-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile header bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-xl px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} className="h-[36px] w-[36px]" />
          <span className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            <span className="hidden min-[375px]:inline">AIOpenLibrary</span>
            <span className="inline min-[375px]:hidden">AIOL</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user && <ZapBalance />}
          <Link
            href="/search?q="
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-stone-50 dark:bg-stone-950 shadow-xl overflow-y-auto md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
