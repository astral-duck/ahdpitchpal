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
    // Try to restore user from sessionStorage if available
    const storedUser = typeof window !== 'undefined' ? window.sessionStorage.getItem('supabaseUser') : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
    supabase.auth.getUser().then(({ data, error }) => {
      if (!ignore) {
        setUser(data?.user || null);
        setLoading(false);
        // Persist user in sessionStorage
        if (typeof window !== 'undefined') {
          if (data?.user) {
            window.sessionStorage.setItem('supabaseUser', JSON.stringify(data.user));
          } else {
            window.sessionStorage.removeItem('supabaseUser');
          }
        }
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
      // Persist user in sessionStorage
      if (typeof window !== 'undefined') {
        if (session?.user) {
          window.sessionStorage.setItem('supabaseUser', JSON.stringify(session.user));
        } else {
          window.sessionStorage.removeItem('supabaseUser');
        }
      }
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
