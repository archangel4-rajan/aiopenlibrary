"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage unavailable
  }
  return "system";
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const resolved = theme === "system" ? getSystemPreference() : theme;
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount (DOM side-effect only, no setState)
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectTheme = useCallback((t: Theme) => {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem("theme", t);
    } catch {
      // localStorage unavailable
    }
    setOpen(false);
  }, []);

  const resolved = theme === "system" ? getSystemPreference() : theme;

  const icon =
    theme === "system" ? (
      <Monitor className="h-4 w-4" />
    ) : resolved === "dark" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Moon className="h-4 w-4" />
    );

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        aria-label="Toggle theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-stone-200 bg-stone-50 py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectTheme(opt.value)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 ${
                theme === opt.value
                  ? "text-stone-900 font-medium dark:text-stone-100"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              {opt.icon}
              {opt.label}
              {theme === opt.value && (
                <span className="ml-auto text-stone-400 dark:text-stone-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
