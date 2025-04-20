"use client";
import RequireProfile from "@/app/components/RequireProfile";

export default function RequireProfileWrapper({ children }: { children: React.ReactNode }) {
  return <RequireProfile>{children}</RequireProfile>;
}
