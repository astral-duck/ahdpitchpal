"use client";

import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

const stats = [
  { label: "Total Conversations", value: "—" },
  { label: "Total Users", value: "—" },
  { label: "Total Requests", value: "—" },
  { label: "Tokens In (monthly)", value: "—" },
  { label: "Tokens Out (monthly)", value: "—" },
  { label: "Monthly Cost", value: "—" },
  { label: "API Usage", value: "—" },
];

const topQuestions = ["—", "—", "—", "—", "—"];

export default function AdminDashboard() {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-8">Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <span className="hover:text-blue-400">Admin Dashboard</span>
          <span className="hover:text-blue-400">Users</span>
          <span className="hover:text-blue-400">Knowledge Base</span>
          <span className="hover:text-blue-400">Feedback</span>
          <span className="hover:text-blue-400">Analytics</span>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg shadow bg-white p-6 flex flex-col items-center">
              <span className="text-gray-500 text-sm mb-2">{stat.label}</span>
              <span className="text-2xl font-bold text-blue-900">{stat.value}</span>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Top Questions</h2>
        <ul className="list-disc pl-6">
          {topQuestions.map((q, i) => (
            <li key={i} className="mb-2">{q}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
