"use client";
import { useState, useEffect } from "react";
import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { useChatbotSettings } from "@/components/chatbot-settings-context";

export default function ChatPageClient({ modelIdFromCookie }: { modelIdFromCookie?: string }) {
  const [id] = useState(() => generateUUID());
  const { model } = useChatbotSettings();

  // Add loading state for session hydration
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check if window.supabase exists and session is hydrated
    const checkSession = async () => {
      // If you use a context/provider for auth, check here instead
      if (typeof window !== "undefined" && window.supabase) {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 48 }}><span>Loading chat...</span></div>;
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={model}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
