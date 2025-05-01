"use client";

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { useChatbotSettings } from '@/components/chatbot-settings-context';
import { useSupabaseUser } from '@/components/supabase-user-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PageClient({ chatId }: { chatId: string }) {
  const { model } = useChatbotSettings();
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [messagesFromDb, setMessagesFromDb] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [error, setError] = useState<string|null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch chat and messages
  useEffect(() => {
    if (!chatId || !user) return;
    async function fetchChatAndMessages() {
      setLoadingChat(true);
      setError(null);
      const supabase = createClientComponentClient();
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
      if (chatError || !chatData) {
        setError('Chat not found');
        setChat(null);
        setMessagesFromDb([]);
        setLoadingChat(false);
        return;
      }
      setChat(chatData);
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (messagesError) {
        setError('Failed to load messages');
        setMessagesFromDb([]);
      } else {
        setMessagesFromDb(messagesData || []);
      }
      setLoadingChat(false);
    }
    fetchChatAndMessages();
  }, [chatId, user]);

  function convertToUIMessages(messages: any[]): any[] {
    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.parts || message.content,
      // ...rest of conversion
    }));
  }

  if (loadingChat) {
    return <div style={{ textAlign: 'center', marginTop: 48 }}><span>Loading chat...</span></div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 48, color: 'red' }}>{error}</div>;
  }
  if (!chat) {
    return <div style={{ textAlign: 'center', marginTop: 48 }}>Chat not found</div>;
  }

  return (
    <>
      <Chat
        key={chatId}
        id={chatId}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={model}
        selectedVisibilityType={chat.visibility || 'private'}
        isReadonly={false}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
