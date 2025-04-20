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
      setError(null);
      // Fetch users from server-side API route
      const res = await fetch('/api/list-users');
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to fetch users.');
        setUsers([]);
        setLoading(false);
        return;
      }
      const usersData = result.users;
      // Fetch roles as before
      const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('user_id, role');
      if (rolesError) {
        setError(rolesError.message || 'Failed to fetch user roles.');
        setUsers([]);
        setLoading(false);
        return;
      }
      // Map roles to emails
      const mappedUsers = rolesData.map((roleRow: any) => {
        const user = usersData.find((u: any) => u.id === roleRow.user_id);
        return {
          id: roleRow.user_id,
          email: user?.email || '',
          role: roleRow.role || 'user',
        };
      });
      setUsers(mappedUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function handleDelete(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeleting(userId);
    setError(null);
    // Call Supabase Admin API to delete user (should be via a server-side API route in production)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      setError(error.message || "Failed to delete user.");
    } else {
      setUsers(users.filter((u) => u.id !== userId));
      if (onDelete) onDelete();
    }
    setDeleting(null);
  }

  return (
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 text-black dark:text-white">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-black dark:text-white">Email</th>
              <th className="border px-4 py-2 text-black dark:text-white">Role</th>
              <th className="border px-4 py-2 text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2 text-black dark:text-white">{user.email}</td>
                <td className="border px-4 py-2 text-black dark:text-white">{user.role}</td>
                <td className="border px-4 py-2 text-black dark:text-white">
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
      )}
    </div>
  );
}
