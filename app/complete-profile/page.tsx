"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CompleteProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        // Optionally prefill existing names
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
        }
      }
    });
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      router.replace("/login");
      return;
    }
    // Upsert profile
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        user_id: session.user.id,
        first_name: firstName,
        last_name: lastName,
      });
    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }
    // After completing profile, always go to /chat
    router.replace("/chat");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/images/american-home-design-logo-main.jpg" alt="American Home Design Logo" className="h-20 object-contain" style={{maxWidth: '100%', maxHeight: '80px'}} />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center">Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-gray-300 bg-blue-50 px-4 py-3 mb-4 w-full rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
            required
            style={{ fontSize: '1rem' }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-gray-300 bg-blue-50 px-4 py-3 mb-4 w-full rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
            required
            style={{ fontSize: '1rem' }}
          />
          {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
          <button
            type="submit"
            className="bg-blue-900 text-white py-3 px-6 rounded w-full font-semibold hover:bg-blue-800 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
