"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/components/supabase-user-context";

const ADMIN_EMAIL = "stevenjleipzig@gmail.com";

export default function AdminDashboard() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // Always require login
    } else if (!loading && user && user.email !== ADMIN_EMAIL) {
      router.replace("/"); // Redirect non-admins
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, admin! (scaffold UI here...)</p>
      {/* TODO: Add user management, chat viewing, knowledge base, analytics, etc. */}
    </div>
  );
}
