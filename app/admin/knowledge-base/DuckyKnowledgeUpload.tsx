"use client";
import { useState } from "react";

export default function DuckyKnowledgeUpload({ onUploaded }: { onUploaded?: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/ducky/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("File uploaded to Ducky.ai knowledge base!");
      setSelectedFile(null);
      if (onUploaded) onUploaded();
    } catch (e: any) {
      setError(e.message || "Failed to upload file");
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center mb-4">
      <label className="mr-2 font-semibold">Upload new document to Ducky.ai:</label>
      <input
        type="file"
        accept=".txt,.pdf"
        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        disabled={uploading}
      />
      <button
        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <span className="ml-4 text-red-600">{error}</span>}
      {success && <span className="ml-4 text-green-600">{success}</span>}
    </div>
  );
}
