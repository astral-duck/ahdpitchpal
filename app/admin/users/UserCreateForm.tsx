"use client";
import { useState } from "react";

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
    // Create user via secure API route
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const result = await res.json();
    console.log("User creation result:", result);
    if (!res.ok) {
      setError(
        (typeof result.error === "string" ? result.error : JSON.stringify(result)) ||
        "Failed to create user"
      );
    } else {
      setSuccess(true);
      setEmail("");
      setPassword("");
      setRole("user");
      if (onUserCreated) onUserCreated();
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
        className="border px-2 py-1 mr-2 mb-2 bg-white text-black dark:bg-gray-800 dark:text-white"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-2 py-1 mr-2 mb-2 bg-white text-black dark:bg-gray-800 dark:text-white"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-2 py-1 mr-2 mb-2 bg-white text-black dark:bg-gray-800 dark:text-white">
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
