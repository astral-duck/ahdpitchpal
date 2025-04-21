"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import UserList from "./UserList";
import UserCreateForm from "./UserCreateForm";
import UserInviteForm from "./UserInviteForm";

export default function AdminUsersPage({ params }: { params?: Promise<any> }) {
  // If you need params, use: const { id } = params ? use(params) : {};
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  const refreshUsers = () => setRefresh((r) => r + 1);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <UserCreateForm onUserCreated={refreshUsers} />
      <UserInviteForm onInviteSent={refreshUsers} />
      {/* The key prop forces UserList to reload after user creation or deletion */}
      <UserList key={refresh} onDelete={refreshUsers} />
    </div>
  );
}
