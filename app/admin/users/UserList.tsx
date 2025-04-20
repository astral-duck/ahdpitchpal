"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  email: string;
  role: string;
}

export default function UserList({ onDelete }: { onDelete?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      // Fetch users and roles from secure view
      const { data, error } = await supabase.from("user_roles_with_email").select("user_id, role, email");
      if (!error && data) {
        setUsers(
          data.map((row: any) => ({
            id: row.user_id,
            email: row.email || "",
            role: row.role || "user",
          }))
        );
      }
      setLoading(false);
    }
    fetchUsers();
  }, [onDelete]);

  async function handleDelete(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeleting(userId);
    setError(null);
    // Call Supabase Admin API to delete user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      setError(error.message);
    } else {
      setUsers(users.filter((u) => u.id !== userId));
      if (onDelete) onDelete();
    }
    setDeleting(null);
  }

  if (loading) return <div>Loading users...</div>;
  if (!users.length) return <div>No users found.</div>;

  return (
    <table className="min-w-full border mt-4">
      <thead>
        <tr>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Role</th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="border px-4 py-2">{user.email}</td>
            <td className="border px-4 py-2">{user.role}</td>
            <td className="border px-4 py-2">
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deleting === user.id}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                {deleting === user.id ? "Deleting..." : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
