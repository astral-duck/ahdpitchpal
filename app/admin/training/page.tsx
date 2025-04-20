"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Correction {
  id: string;
  question: string;
  original_answer: string;
  corrected_answer: string;
  created_at: string;
}

export default function AdminTrainingPage() {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [originalAnswer, setOriginalAnswer] = useState("");
  const [correctedAnswer, setCorrectedAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  useEffect(() => {
    async function fetchCorrections() {
      setLoading(true);
      const { data, error } = await supabase
        .from("rag_chunks")
        .select("id, metadata->>question as question, content as original_answer, correction, created_at")
        .not("correction", "is", null)
        .order("created_at", { ascending: false });
      if (data) {
        setCorrections(
          data.map((row: any) => ({
            id: row.id,
            question: row.question,
            original_answer: row.original_answer,
            corrected_answer: row.correction,
            created_at: row.created_at,
          }))
        );
      }
      setLoading(false);
    }
    if (role === "admin") fetchCorrections();
  }, [role, success]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    // Insert a new correction (find the chunk by question+answer or create a new one)
    await supabase.from("rag_chunks").insert({
      content: originalAnswer,
      correction: correctedAnswer,
      metadata: { question },
    });
    setSaving(false);
    setSuccess(true);
    setQuestion("");
    setOriginalAnswer("");
    setCorrectedAnswer("");
  }

  if (loadingRole || loading) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chatbot Training / Corrections</h2>
      <form onSubmit={handleSave} className="mb-8">
        <input
          className="border rounded p-2 mr-2 w-56"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <input
          className="border rounded p-2 mr-2 w-56"
          placeholder="Original Answer"
          value={originalAnswer}
          onChange={(e) => setOriginalAnswer(e.target.value)}
          required
        />
        <input
          className="border rounded p-2 mr-2 w-56"
          placeholder="Corrected Answer"
          value={correctedAnswer}
          onChange={(e) => setCorrectedAnswer(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Correction"}
        </button>
        {success && <div className="text-green-600 mt-2">Correction saved!</div>}
      </form>
      <h3 className="text-lg font-semibold mb-2">Correction History</h3>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Question</th>
            <th className="border px-4 py-2">Original Answer</th>
            <th className="border px-4 py-2">Corrected Answer</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {corrections.map((c) => (
            <tr key={c.id}>
              <td className="border px-4 py-2">{c.question}</td>
              <td className="border px-4 py-2">{c.original_answer}</td>
              <td className="border px-4 py-2">{c.corrected_answer}</td>
              <td className="border px-4 py-2">{new Date(c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
