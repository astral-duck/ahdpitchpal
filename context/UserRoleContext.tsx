"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/supabase-user-context";

interface UserRoleContextType {
  role: string | null;
  loadingRole: boolean;
  refreshRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  loadingRole: true,
  refreshRole: async () => {},
});

export function useUserRole() {
  return useContext(UserRoleContext);
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseUser();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const fetchRole = async () => {
    setLoadingRole(true);
    if (!user) {
      setRole(null);
      setLoadingRole(false);
      return;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    console.log("[UserRoleProvider] fetchRole result:", { data, error, user_id: user.id });
    if (error) {
      setRole(null);
    } else {
      setRole(data?.role || null);
    }
    setLoadingRole(false);
  };

  useEffect(() => {
    // DEBUG: Log user and role fetch
    console.log("[UserRoleProvider] user:", user);
    fetchRole();
    // Optionally, subscribe to auth changes and re-fetch role
  }, [user]);

  return (
    <UserRoleContext.Provider value={{ role, loadingRole, refreshRole: fetchRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}
