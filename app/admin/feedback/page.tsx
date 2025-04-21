"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function AdminFeedbackPage({ params }: { params?: Promise<any> }) {
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
      <h2 className="text-2xl font-bold mb-4">Feedback Review</h2>
      <div className="text-gray-500">(Coming soon: View flagged answers, user info, and full conversations)</div>
    </div>
  );
}
