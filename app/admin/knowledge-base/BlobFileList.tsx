"use client";
import { useEffect, useState } from "react";

interface BlobFile {
  key: string;
  size: number;
  contentType: string;
  lastModified: string;
}

export default function BlobFileList({
  onDelete,
  onUpload,
}: {
  onDelete: (key: string) => void;
  onUpload: (file: File) => void;
}) {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const res = await fetch("/api/blob/list");
        const data = await res.json();
        if (res.ok && Array.isArray(data.files)) {
          setFiles(data.files);
        } else {
          setFiles([]); // fallback to empty array
          // Optionally, set an error state to show a message
        }
      } catch (err) {
        setFiles([]); // fallback to empty array on fetch error
        // Optionally, set an error state to show a message
      }
      setLoading(false);
    }
    fetchFiles();
  }, []);

  async function handleDelete(key: string) {
    if (!window.confirm("Delete this file from blob storage?")) return;
    await onDelete(key);
    setFiles((prev) => prev.filter((f) => f.key !== key));
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    await onUpload(selectedFile);
    setUploading(false);
    setSelectedFile(null);
    // Refresh list
    try {
      const res = await fetch("/api/blob/list");
      const data = await res.json();
      if (res.ok && Array.isArray(data.files)) {
        setFiles(data.files);
      } else {
        setFiles([]);
      }
    } catch (err) {
      setFiles([]);
    }
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">Upload new file:</label>
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
        />
        <button
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          Upload
        </button>
        {selectedFile && !uploading && (
          <span className="ml-2 text-gray-700">{selectedFile.name}</span>
        )}
        {uploading && <span className="ml-2 text-gray-500">Uploading...</span>}
      </div>
      <h3 className="font-semibold mb-2">Blob Storage Files</h3>
      {loading ? (
        <div>Loading files...</div>
      ) : files.length === 0 ? (
        <div>No files found in blob storage.</div>
      ) : (
        <table className="min-w-full border text-xs mb-6">
          <thead>
            <tr>
              <th className="border px-2 py-1">File Name</th>
              <th className="border px-2 py-1">Size</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Last Modified</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.key}>
                <td className="border px-2 py-1">{file.key}</td>
                <td className="border px-2 py-1">{(file.size / 1024).toFixed(1)} KB</td>
                <td className="border px-2 py-1">{file.contentType}</td>
                <td className="border px-2 py-1">{new Date(file.lastModified).toLocaleString()}</td>
                <td className="border px-2 py-1">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(file.key)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
