"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserCreateForm({ onUserCreated }: { onUserCreated?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Create user via Supabase admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
    });
    if (error) {
      setError(error.message);
    } else {
      // Add user role to user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert([
        { user_id: data.user.id, role },
      ]);
      if (roleError) {
        setError("User created, but failed to assign role: " + roleError.message);
      } else {
        setSuccess(true);
        setEmail("");
        setPassword("");
        setRole("user");
        if (onUserCreated) onUserCreated();
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Create New User</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-2 py-1 mr-2 mb-2"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-2 py-1 mr-2 mb-2"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-2 py-1 mr-2 mb-2">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-1 rounded">
        {loading ? "Creating..." : "Create User"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">User created!</div>}
    </form>
  );
}
