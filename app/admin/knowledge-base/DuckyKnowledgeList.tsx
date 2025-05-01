"use client";
import { useEffect, useState } from "react";

interface DuckyDoc {
  id: string;
  title: string;
  source_document_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export default function DuckyKnowledgeList() {
  const [docs, setDocs] = useState<DuckyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ducky/list");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setDocs(data.documents || []);
      } catch (e: any) {
        setError(e.message || "Failed to fetch knowledge base docs");
      }
      setLoading(false);
    }
    fetchDocs();
  }, []);

  if (loading) return <div>Loading knowledge base...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!docs.length) return <div>No documents found in Ducky.ai knowledge base.</div>;

  return (
    <div className="mt-6 max-h-[600px] overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Knowledge Base Documents (Ducky.ai)</h3>
      <table className="min-w-full border text-xs">
        <thead>
          <tr>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Source</th>
            <th className="border px-2 py-1">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id}>
              <td className="border px-2 py-1">{doc.title}</td>
              <td className="border px-2 py-1">{doc.source_document_id || "-"}</td>
              <td className="border px-2 py-1">{doc.created_at ? new Date(doc.created_at).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
