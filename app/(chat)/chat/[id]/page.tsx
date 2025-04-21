"use client";

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { useChatbotSettings } from '@/components/chatbot-settings-context';
import { useSupabaseUser } from '@/components/supabase-user-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { model } = useChatbotSettings();
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [messagesFromDb, setMessagesFromDb] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch chat and messages
  useEffect(() => {
    if (!id) return;
    async function fetchChatAndMessages() {
      setLoadingChat(true);
      const { data: chatData } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .single();
      setChat(chatData);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });
      setMessagesFromDb(messagesData || []);
      setLoadingChat(false);
    }
    fetchChatAndMessages();
  }, [id]);

  function convertToUIMessages(messages: any[]): any[] {
    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.parts || message.content,
      createdAt: message.created_at,
      attachments: message.attachments || [],
    }));
  }

  if (loading || loadingChat) return <div>Loading...</div>;
  if (!user) return null; // Already redirected
  if (!chat) return <div>Chat not found</div>;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={model}
        selectedVisibilityType={chat.visibility}
        isReadonly={true}
      />
      <DataStreamHandler chatId={chat.id} />
    </>
  );
}
