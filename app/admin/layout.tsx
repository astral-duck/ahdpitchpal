// app/admin/layout.tsx
"use client";
import React, { useEffect } from "react";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChatbotSettingsProvider } from "@/components/chatbot-settings-context";

const navLinks = [
  { label: "Home", href: "/chat" },
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Knowledge Base", href: "/admin/knowledge-base" },
  { label: "Feedback", href: "/admin/feedback" },
  { label: "Chat History", href: "/admin/chat-history" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Training", href: "/admin/training" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loadingRole) return;
    if (role !== "admin") {
      // Only redirect if not already on an /admin page
      if (!pathname?.startsWith("/admin")) {
        router.replace("/");
      }
    }
  }, [role, loadingRole, router, pathname]);

  if (loadingRole) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  return (
    <ChatbotSettingsProvider>
      <div className="flex min-h-screen bg-background text-foreground transition-colors">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex flex-col p-4 min-h-screen border-r border-sidebar-border">
          <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-background p-8 text-foreground transition-colors">
          {children}
        </main>
      </div>
    </ChatbotSettingsProvider>
  );
}
