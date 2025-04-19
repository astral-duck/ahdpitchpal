"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/components/supabase-user-context";
import RequireAuthAdmin from "./require-auth-admin";

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
    <RequireAuthAdmin>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg shadow bg-white p-6 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Analytics Overview</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Total Conversations: <span className="font-mono">—</span></li>
              <li>Total Requests: <span className="font-mono">—</span></li>
              <li>Tokens In: <span className="font-mono">—</span></li>
              <li>Tokens Out: <span className="font-mono">—</span></li>
              <li>Monthly Cost: <span className="font-mono">—</span></li>
            </ul>
          </div>
          <div className="rounded-lg shadow bg-white p-6 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Top 5 FAQs</h2>
            <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
              <li>—</li>
              <li>—</li>
              <li>—</li>
              <li>—</li>
              <li>—</li>
            </ol>
          </div>
        </div>
        <div className="rounded-lg shadow bg-white p-6 mt-8">
          <h2 className="text-lg font-semibold mb-2">Feedback Panel</h2>
          <div className="text-sm text-gray-700">No feedback yet.</div>
        </div>
      </div>
    </RequireAuthAdmin>
  );
}
