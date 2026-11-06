import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type Profile = { role?: string | null; full_name?: string | null };
type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Unable to load profile", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        return loadProfile(currentUser);
      })
      .catch(() => {
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
