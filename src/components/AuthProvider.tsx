"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { DbProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
});

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: DbProfile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<DbProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check for existing session on mount (handles page reloads, mobile resume)
    const checkSession = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && !user) {
          setUser(currentUser);
          setIsLoading(true);
          await fetchProfile(currentUser.id);
          setIsLoading(false);
        } else if (!currentUser && user) {
          setUser(null);
          setProfile(null);
        }
      } catch {
        // Silent fail — server-rendered initial state is still valid
      }
    };

    // Only check if we don't have initial state (handles mobile resume from background)
    if (!initialUser) {
      checkSession();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        setUser(session.user);
        // Only fetch profile if we don't already have one for this user
        if (!profile || profile.id !== session.user.id) {
          setIsLoading(true);
          await fetchProfile(session.user.id);
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, initialUser, user, profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.role === "admin",
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
