"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    // Send invite (password setup) email
    const { error: inviteError } = await supabase.auth.api.resetPasswordForEmail(email);
    if (inviteError) {
      setError(inviteError.message);
    } else {
      // Look up user by email
      const { data: userLookup, error: lookupError } = await supabase.auth.admin.listUsers();
      if (lookupError) {
        setError('Invite sent, but failed to lookup user for role assignment: ' + lookupError.message);
      } else {
        const user = userLookup.users.find((u: any) => u.email === email);
        if (user) {
          // Insert role if not already present
          const { error: roleError } = await supabase.from("user_roles").upsert([
            { user_id: user.id, role: "user" },
          ], { onConflict: ["user_id"] });
          if (roleError) {
            setError('Invite sent, but failed to assign role: ' + roleError.message);
          } else {
            setSuccess(true);
            setInviteLink(`A password setup link has been sent to ${email}.`);
            setEmail("");
            if (onInviteSent) onInviteSent();
          }
        } else {
          setError('Invite sent, but user not found yet. Role will need to be assigned after signup.');
        }
      }
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
        className="bg-blue-600 text-white px-4 py-1 rounded"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {inviteLink && <div className="text-green-600 mt-2">{inviteLink}</div>}
    </form>
  );
}
