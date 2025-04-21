"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import BlobFileList from "./BlobFileList";
import KnowledgeBaseChunks from "./KnowledgeBaseChunks";

export default function AdminKnowledgeBasePage({ params }: { params?: Promise<any> }) {
  // If you need params, use: const { id } = params ? use(params) : {};
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
  const [chunkingStatus, setChunkingStatus] = useState<string>("");
  const [checkingChunks, setCheckingChunks] = useState(false);
  const [unchunkedFiles, setUnchunkedFiles] = useState<string[]>([]);
  const [showChunkButton, setShowChunkButton] = useState(false);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  // Placeholder handlers for blob actions (to be implemented with API routes)
  async function handleDelete(key: string) {
    await fetch("/api/blob/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
  }
  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/blob/upload", {
      method: "POST",
      body: formData,
    });
    // Auto-chunking and embedding will be triggered server-side after upload
  }

  async function checkUnchunkedFiles() {
    setCheckingChunks(true);
    setChunkingStatus("");
    setShowChunkButton(false);
    const res = await fetch("/api/blob/unchunked-files");
    const data = await res.json();
    if (data.unchunkedFiles && data.unchunkedFiles.length > 0) {
      setUnchunkedFiles(data.unchunkedFiles);
      setShowChunkButton(true);
      setChunkingStatus(`Found ${data.unchunkedFiles.length} unchunked files.`);
    } else {
      setChunkingStatus("All files are chunked.");
      setUnchunkedFiles([]);
      setShowChunkButton(false);
    }
    setCheckingChunks(false);
  }

  async function handleChunkUnchunked() {
    setChunkingStatus("Chunking missing files...");
    // Call backend to chunk unchunkedFiles
    await fetch("/api/blob/chunk-unchunked", { method: "POST" });
    setChunkingStatus("Chunking triggered. Please refresh in a moment.");
    setShowChunkButton(false);
  }

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Knowledge Base Management</h2>
      <div className="text-gray-500 mb-4">Upload, view, and manage docs in blob storage. Files are auto-chunked and embedded for RAG.</div>
      <BlobFileList onDelete={handleDelete} onUpload={handleUpload} />
      <div className="my-4 flex items-center gap-4">
        <button
          className="px-3 py-1 bg-green-700 text-white rounded border border-green-900 shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={checkUnchunkedFiles}
          disabled={checkingChunks}
        >
          Check Chunking
        </button>
        {showChunkButton && unchunkedFiles.length > 0 && (
          <button
            className="px-3 py-1 bg-yellow-600 text-white rounded border border-yellow-900 shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={handleChunkUnchunked}
          >
            Chunk {unchunkedFiles.length} Unchunked Files
          </button>
        )}
        {checkingChunks && <span className="text-gray-500">Checking...</span>}
        {chunkingStatus && <span className="text-gray-700 font-semibold">{chunkingStatus}</span>}
      </div>
      <KnowledgeBaseChunks />
    </div>
  );
}
