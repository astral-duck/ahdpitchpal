"use client";
import { useState } from "react";
import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { useChatbotSettings } from "@/components/chatbot-settings-context";

export default function ChatPageClient({ modelIdFromCookie }: { modelIdFromCookie?: string }) {
  const [id] = useState(() => generateUUID());
  const { model } = useChatbotSettings();
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
