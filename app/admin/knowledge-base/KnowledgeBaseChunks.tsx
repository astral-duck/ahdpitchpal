"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Chunk {
  id: string;
  file_name: string;
  chunk_index: number;
  content: string;
  citation?: string;
  correction?: string;
  flagged: boolean;
}

export default function KnowledgeBaseChunks({ fileName }: { fileName?: string }) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    async function fetchChunks() {
      setLoading(true);
      let query = supabase
        .from("rag_chunks")
        .select("id, file_name, chunk_index, content, citation, correction, flagged")
        .order("chunk_index", { ascending: true });
      if (fileName) query = query.eq("file_name", fileName);
      const { data, error } = await query;
      if (data) setChunks(data);
      setLoading(false);
    }
    fetchChunks();
  }, [fileName]);

  if (loading) return <div>Loading chunks...</div>;
  if (!chunks.length) return <div>No chunks found for this file.</div>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Knowledge Chunks{fileName ? ` for ${fileName}` : ''}</h3>
      <table className="min-w-full border text-xs">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Content</th>
            <th className="border px-2 py-1">Citation</th>
            <th className="border px-2 py-1">Correction</th>
            <th className="border px-2 py-1">Flagged</th>
          </tr>
        </thead>
        <tbody>
          {chunks.map((chunk) => (
            <tr key={chunk.id}>
              <td className="border px-2 py-1">{chunk.chunk_index}</td>
              <td className="border px-2 py-1 max-w-xs">
                {showFull[chunk.id] ? (
                  <span className="whitespace-pre-wrap">{chunk.content}</span>
                ) : (
                  <>
                    <span className="truncate block" style={{ maxWidth: 300 }}>{chunk.content}</span>
                    {chunk.content.length > 120 && (
                      <button
                        className="ml-1 text-blue-600 underline text-xs"
                        onClick={() => setShowFull((prev) => ({ ...prev, [chunk.id]: true }))}
                      >
                        Show more
                      </button>
                    )}
                  </>
                )}
              </td>
              <td className="border px-2 py-1">{chunk.citation}</td>
              <td className="border px-2 py-1">{chunk.correction}</td>
              <td className="border px-2 py-1">{chunk.flagged ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
