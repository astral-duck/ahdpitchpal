"use client";
import { useSupabaseUser } from "@/components/supabase-user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';

export default function RequireAuthAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      console.log("[RequireAuthAdmin] Checking admin role for user:", user);
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      console.log("[RequireAuthAdmin] Supabase admin check result:", { data, error });
      setIsAdmin(!!data);
      setChecking(false);
    }
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && !checking && !isAdmin) {
      router.replace("/");
    }
  }, [user, loading, isAdmin, checking, router]);

  if (loading || checking || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <>{children}</>;
}
