"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlobFileList from "./BlobFileList";
import KnowledgeBaseChunks from "./KnowledgeBaseChunks";

export default function AdminKnowledgeBasePage() {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

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

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Knowledge Base Management</h2>
      <div className="text-gray-500 mb-4">Upload, view, and manage docs in blob storage. Files are auto-chunked and embedded for RAG.</div>
      <BlobFileList onDelete={handleDelete} onUpload={handleUpload} />
      {/* File selection for filtering chunks */}
      <div className="mb-4 mt-8">
        <label className="mr-2">Filter by file:</label>
        <input
          type="text"
          placeholder="Enter file name (optional)"
          value={selectedFile || ""}
          onChange={(e) => setSelectedFile(e.target.value || undefined)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <KnowledgeBaseChunks fileName={selectedFile} />
    </div>
  );
}
