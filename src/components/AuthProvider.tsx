"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { DbProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  isAdmin: boolean;
  isCreator: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isCreator: false,
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
  const profileFetchedForId = useRef<string | null>(initialProfile?.id ?? null);

  const fetchProfile = useCallback(async (userId: string) => {
    // Guard against redundant fetches
    if (profileFetchedForId.current === userId) return;
    profileFetchedForId.current = userId;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
    } catch {
      // Profile fetch failed — user is still authenticated, just no profile data
      profileFetchedForId.current = null;
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") &&
        session?.user
      ) {
        setUser(session.user);
        if (profileFetchedForId.current !== session.user.id) {
          setIsLoading(true);
          await fetchProfile(session.user.id);
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        profileFetchedForId.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.role === "admin",
        isCreator: profile?.role === "creator" || profile?.role === "admin",
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
