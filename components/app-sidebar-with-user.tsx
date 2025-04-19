"use client";
import { useSupabaseUser } from "@/components/supabase-user-context";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppSidebarWithUser() {
  const { user, loading } = useSupabaseUser();
  return <AppSidebar user={user} loading={loading} />;
}
