import RequireAuthAdmin from "../require-auth-admin";
import React from "react";
import Link from "next/link";

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
  return (
    <RequireAuthAdmin>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
          <h2 className="text-xl font-bold mb-8">Admin Dashboard</h2>
          <nav className="flex flex-col gap-4">
            <Link href="/admin" className="hover:text-blue-400">Admin Dashboard</Link>
            <Link href="/admin/users" className="hover:text-blue-400">Users</Link>
            <Link href="/admin/knowledge-base" className="hover:text-blue-400">Knowledge Base</Link>
            <Link href="/admin/feedback" className="hover:text-blue-400">Feedback</Link>
            <Link href="/admin/analytics" className="hover:text-blue-400">Analytics</Link>
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
          <div className="rounded-lg shadow bg-white p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Feedback Panel</h2>
            <div className="text-sm text-gray-700">No feedback yet.</div>
          </div>
          <div className="rounded-lg shadow bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Top 5 Most Frequently Asked Questions</h2>
            <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
              {topQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        </main>
      </div>
    </RequireAuthAdmin>
  );
}
