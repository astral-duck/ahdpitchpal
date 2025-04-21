"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
      },
    ]);
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    router.push("/"); // Redirect after completion
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/images/american-home-design-logo-main.jpg" alt="American Home Design Logo" className="h-12 object-contain" style={{maxWidth: '100%', maxHeight: '48px'}} />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center">Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border px-2 py-2 mb-4 w-full rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border px-2 py-2 mb-4 w-full rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
          {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
          {success && <div className="text-green-600 mt-4 text-center">Profile completed!</div>}
        </form>
      </div>
    </div>
  );
}
