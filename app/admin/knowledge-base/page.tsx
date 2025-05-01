"use client";
import { useEffect } from "react";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import DuckyKnowledgeUpload from "./DuckyKnowledgeUpload";

export default function AdminKnowledgeBasePage({ params }: { params?: Promise<any> }) {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Knowledge Base Management</h2>
      <div className="text-gray-500 mb-4">Upload, view, and manage docs in Ducky.ai knowledge base. Files are indexed and retrieved via Ducky.ai for RAG.</div>
      <DuckyKnowledgeUpload />
    </div>
  );
}
