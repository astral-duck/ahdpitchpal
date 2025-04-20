"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminSettingsPage() {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  useEffect(() => {
    async function fetchInstructions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("instructions")
        .single();
      if (data && data.instructions) setInstructions(data.instructions);
      setLoading(false);
    }
    if (role === "admin") fetchInstructions();
  }, [role]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    await supabase.from("chatbot_settings").upsert({ id: 1, instructions });
    setSaving(false);
    setSuccess(true);
  }

  if (loadingRole || loading) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chatbot Instructions / Personality</h2>
      <form onSubmit={handleSave}>
        <textarea
          className="w-full h-60 border rounded p-2 font-mono"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter high-level instructions, identity, scope, tone, etc."
        />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {success && <div className="text-green-600 mt-2">Instructions saved!</div>}
      </form>
    </div>
  );
}
