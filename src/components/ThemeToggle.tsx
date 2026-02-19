"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

function getThemeSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): "dark" | "light" {
  return "light";
}

/**
 * Initialise the theme from localStorage / system preference.
 * Guarded so it only runs once, even if React re-subscribes.
 */
let themeInitialised = false;

function ensureThemeInit(): void {
  if (themeInitialised) return;
  themeInitialised = true;

  try {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      !stored &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || prefersDark) {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
}

function subscribeToTheme(callback: () => void): () => void {
  // One-time initialisation (safe across re-subscriptions)
  ensureThemeInit();

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );
  const dark = theme === "dark";

  const toggle = useCallback(() => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
