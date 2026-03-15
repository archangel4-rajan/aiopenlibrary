"use client";

/**
 * Provides client-side activity tracking via React context.
 * Auto-tracks page views on route changes.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { ClientTracker } from "@/lib/tracking";

const TrackingContext = createContext<ClientTracker | null>(null);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const trackerRef = useRef<ClientTracker | null>(null);
  const pathname = usePathname();

  // Initialize tracker once
  if (!trackerRef.current && typeof window !== "undefined") {
    trackerRef.current = new ClientTracker();
  }

  // Auto-track page views on route changes
  useEffect(() => {
    trackerRef.current?.trackPageView(pathname);
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      trackerRef.current?.destroy();
    };
  }, []);

  return (
    <TrackingContext.Provider value={trackerRef.current}>
      {children}
    </TrackingContext.Provider>
  );
}

/** Access the client tracker from any component. */
export function useTracking() {
  const tracker = useContext(TrackingContext);
  return tracker;
}
