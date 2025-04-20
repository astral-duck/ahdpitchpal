import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function normalizeFileName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.trim().replace(/(\.txt)+$/i, ".txt").toLowerCase();
}

interface Chunk {
  id: string;
  file_name: string;
  chunk_index: number;
  content: string;
  citation?: string;
  correction?: string;
  flagged: boolean;
}

export default function KnowledgeBaseChunks() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState<{ [id: string]: boolean }>({});
  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");

  useEffect(() => {
    async function fetchChunks() {
      setLoading(true);
      let query = supabase
        .from("rag_chunks")
        .select("*") // fetch all columns for debugging
        .order("file_name", { ascending: true })
        .order("chunk_index", { ascending: true });
      // REMOVE file filter for debugging
      // if (selectedFile) query = query.eq("file_name", normalizeFileName(selectedFile));
      const { data, error } = await query;
      console.log("Chunks data:", data, "Error:", error);
      if (data) setChunks(data);
      setLoading(false);
    }
    fetchChunks();
  }, []);

  useEffect(() => {
    async function fetchFileOptions() {
      const { data, error } = await supabase
        .from("rag_chunks")
        .select("file_name")
        .order("file_name", { ascending: true });
      if (data) {
        // Filter out undefined/null file names and ensure unique, non-empty strings
        const uniqueFiles = Array.from(
          new Set(
            data
              .map((row: any) => normalizeFileName(row.file_name))
              .filter((name): name is string => !!name && typeof name === "string")
          )
        );
        setFileOptions(uniqueFiles);
      }
    }
    fetchFileOptions();
  }, []);

  if (loading) return <div>Loading chunks...</div>;
  if (!chunks.length) return <div>No chunks found.</div>;

  return (
    <div className="mt-6 max-h-[600px] overflow-auto">
      {/* File filter dropdown is hidden for now during debugging */}
      <h3 className="text-lg font-semibold mb-2">Knowledge Chunks</h3>
      <table className="min-w-full border text-xs">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">File</th>
            <th className="border px-2 py-1">Content</th>
            <th className="border px-2 py-1">Citation</th>
            <th className="border px-2 py-1">Correction</th>
            <th className="border px-2 py-1">Flagged</th>
          </tr>
        </thead>
        <tbody>
          {chunks.slice(0, 100).map((chunk) => (
            <tr key={chunk.id}>
              <td className="border px-2 py-1">{chunk.chunk_index}</td>
              <td className="border px-2 py-1">{chunk.file_name}</td>
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
