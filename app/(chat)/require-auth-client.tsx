"use client";
import { useSupabaseUser } from "@/components/supabase-user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuthClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  return <>{children}</>;
}
