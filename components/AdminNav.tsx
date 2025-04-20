"use client";
import { useUserRole } from "@/context/UserRoleContext";

export function AdminNav() {
  const { role, loadingRole } = useUserRole();
  // DEBUG: Log role and loading state
  console.log("[AdminNav] role:", role, "loadingRole:", loadingRole);
  if (loadingRole) return null;
  if (role !== "admin") return null;
  return (
    <nav className="flex gap-4 items-center">
      <a
        href="/admin"
        className="text-blue-700 font-semibold hover:underline"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        Admin Dashboard
      </a>
    </nav>
  );
}
