"use client";
import { useSupabaseUser } from "@/components/supabase-user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_EMAIL = "stevenjleipzig@gmail.com";

export default function RequireAuthAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && user.email !== ADMIN_EMAIL) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  return <>{children}</>;
}
