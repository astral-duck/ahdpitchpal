// Scaffolded admin dashboard using nextjs-dashboard structure, now handled by /admin/layout.tsx

"use client";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      {/* Placeholder for dashboard widgets or children */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg shadow bg-white p-6 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-2">Total Conversations</span>
          <span className="text-2xl font-bold text-blue-900">—</span>
        </div>
        <div className="rounded-lg shadow bg-white p-6 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-2">Total Users</span>
          <span className="text-2xl font-bold text-blue-900">—</span>
        </div>
        <div className="rounded-lg shadow bg-white p-6 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-2">Monthly Cost</span>
          <span className="text-2xl font-bold text-blue-900">—</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Top Questions</h2>
      <ul className="list-disc pl-6">
        {["—", "—", "—", "—", "—"].map((q, i) => (
          <li key={i} className="mb-2">{q}</li>
        ))}
      </ul>
    </div>
  );
}
