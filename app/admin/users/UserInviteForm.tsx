"use client";
import { useState } from "react";

export default function UserInviteForm({ onInviteSent }: { onInviteSent?: () => void }) {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState<{email: string, status: string, error?: string}[]>([]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setResults([]);
    // Split emails by comma or newline, trim spaces
    const emailList = emails.split(/[\s,]+/).map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      setError("Please enter at least one valid email.");
      setLoading(false);
      return;
    }
    const inviteResults: {email: string, status: string, error?: string}[] = [];
    for (const email of emailList) {
      try {
        const res = await fetch("/api/invite-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await res.json();
        if (!res.ok) {
          inviteResults.push({ email, status: "error", error: result.error || "Failed to send invite" });
        } else {
          inviteResults.push({ email, status: "success" });
        }
      } catch (err) {
        inviteResults.push({ email, status: "error", error: String(err) });
      }
    }
    setResults(inviteResults);
    setSuccess(inviteResults.every(r => r.status === "success"));
    setEmails("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleInvite} className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Bulk User Invite</h3>
      <textarea
        placeholder="Paste emails separated by commas or new lines"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        className="border px-2 py-2 mb-2 w-full rounded"
        rows={3}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-1 rounded w-full"
      >
        {loading ? "Sending..." : "Send Invites"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Results:</h4>
          <ul>
            {results.map((r, i) => (
              <li key={i} className={r.status === "success" ? "text-green-600" : "text-red-500"}>
                {r.email}: {r.status === "success" ? "Invite sent" : `Error: ${r.error}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
