"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (opts: { message: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const noopToast = { toast: () => {} };

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return noopToast;
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ message, type = "success" }: { message: string; type?: ToastType }) => {
      const id = `toast-${++toastId}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), 3000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 ${
              t.exiting
                ? "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            } ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200"
                : t.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/80 dark:text-red-200"
                  : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
            }`}
          >
            <span className="text-sm font-medium">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
