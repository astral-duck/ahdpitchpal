"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface Correction {
  id: string;
  question: string;
  original_answer: string;
  corrected_answer: string;
  created_at: string;
}

export default function AdminTrainingPage({ params }: { params?: Promise<any> }) {
  // If you need params, use: const { id } = params ? use(params) : {};
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [originalAnswer, setOriginalAnswer] = useState("");
  const [correctedAnswer, setCorrectedAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- NEW: Mode selection (Review/Train) ---
  const [mode, setMode] = useState<'review' | 'train'>('review');
  const [downvotes, setDownvotes] = useState<any[]>([]);
  const [pendingCorrections, setPendingCorrections] = useState<Correction[]>([]);

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

  // --- Replace downvote fetch with API call ---
  useEffect(() => {
    async function fetchDownvotes() {
      setLoading(true);
      const res = await fetch('/api/admin/downvotes');
      if (res.ok) {
        const data = await res.json();
        setDownvotes(data);
      } else {
        setDownvotes([]);
      }
      setLoading(false);
    }
    if (role === 'admin' && mode === 'review') fetchDownvotes();
  }, [role, mode, success]);

  // Fetch corrections for Train mode
  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_corrections')
        .select('*')
        .eq('completed', false)
        .order('created_at', { ascending: false });
      if (data) setPendingCorrections(data);
      setLoading(false);
    }
    if (role === 'admin' && mode === 'train') fetchPending();
  }, [role, mode, success]);

  // --- Correction Save for Review (now uses API) ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    // Find the vote_id for the current question
    const vote = downvotes.find(v => v.question === question);
    const vote_id = vote?.id;
    const payload = { question, original_answer: originalAnswer, corrected_answer: correctedAnswer, vote_id };
    const res = await fetch('/api/admin/correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      setQuestion("");
      setOriginalAnswer("");
      setCorrectedAnswer("");
    }
  }

  // --- New: Populate fields from selected vote row ---
  function handleSelectVote(vote: any) {
    setQuestion(vote.question || vote.message_id || "");
    setOriginalAnswer(vote.original_answer || ""); // You may need to fetch this
    setCorrectedAnswer("");
  }

  // --- Export to Ducky (already uses API) ---
  async function handleExportToDucky() {
    setSaving(true);
    // 1. Fetch all pending corrections
    const res = await fetch('/api/admin/export_to_ducky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txt: pendingCorrections.map(c => `Q: ${c.question}\nOriginal: ${c.original_answer}\nCorrected: ${c.corrected_answer}\n---`).join('\n') }),
    });
    setSaving(false);
    if (res.ok) setSuccess(true);
  }

  if (loadingRole || loading) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chatbot Training / Corrections</h2>
      {/* Mode Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Mode:</label>
        <select value={mode} onChange={e => setMode(e.target.value as any)} className="border rounded p-2">
          <option value="review">Review (Votes)</option>
          <option value="train">Train (Corrections)</option>
        </select>
      </div>

      {/* Review Mode: Downvoted Messages */}
      {mode === 'review' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Downvoted Messages</h3>
          <table className="min-w-full border mb-6">
            <thead>
              <tr>
                <th className="border px-4 py-2">Question</th>
                <th className="border px-4 py-2">Original Answer</th>
                <th className="border px-4 py-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {downvotes.map((vote) => (
                <tr key={vote.id}>
                  <td className="border px-4 py-2">{vote.question || vote.message_id}</td>
                  <td className="border px-4 py-2">{vote.original_answer || '(fetch original answer)'}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleSelectVote(vote)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Correction Form */}
          <form onSubmit={handleSave} className="mb-8 flex gap-2">
            <input
              className="border rounded p-2 w-56"
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <input
              className="border rounded p-2 w-56"
              placeholder="Original Answer"
              value={originalAnswer}
              onChange={(e) => setOriginalAnswer(e.target.value)}
              required
            />
            <input
              className="border rounded p-2 w-56"
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
        </div>
      )}

      {/* Train Mode: Corrections Table & Export */}
      {mode === 'train' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Pending Corrections</h3>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
            onClick={handleExportToDucky}
            disabled={saving || pendingCorrections.length === 0}
          >
            {saving ? 'Exporting...' : 'Export to Ducky.ai'}
          </button>
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
              {pendingCorrections.map(c => (
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
      )}
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
