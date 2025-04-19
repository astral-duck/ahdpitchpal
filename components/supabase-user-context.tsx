"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface SupabaseUserContextValue {
  user: any | null;
  loading: boolean;
}

const SupabaseUserContext = createContext<SupabaseUserContextValue>({ user: null, loading: true });

export function SupabaseUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!ignore) {
        setUser(data?.user || null);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseUserContext.Provider value={{ user, loading }}>
      {children}
    </SupabaseUserContext.Provider>
  );
}

export function useSupabaseUser() {
  return useContext(SupabaseUserContext);
}
