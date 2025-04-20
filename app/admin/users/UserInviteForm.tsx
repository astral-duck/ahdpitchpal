"use client";
import { useState } from "react";

export default function UserInviteForm({ onInviteSent }: { onInviteSent?: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInviteLink(null);
    // Call new API route
    const res = await fetch("/api/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Failed to send invite");
    } else {
      setSuccess(true);
      setInviteLink(`A password setup link has been sent to ${email}.`);
      setEmail("");
      if (onInviteSent) onInviteSent();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleInvite} className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Send User Invite</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-2 py-1 mr-2 mb-2"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && inviteLink && <div className="text-green-600 mt-2">{inviteLink}</div>}
    </form>
  );
}
