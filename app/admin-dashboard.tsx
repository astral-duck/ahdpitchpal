"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/components/supabase-user-context";
import RequireAuthAdmin from "./require-auth-admin";

export default function AdminDashboard() {
  // This page just redirects to /admin. All admin gating is handled in /admin and RequireAuthAdmin.
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return null;
}
