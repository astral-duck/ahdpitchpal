import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DBMessage } from '@/lib/db/schema';
import { Attachment, UIMessage } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Initialize Supabase client (adjust URL/key as needed or use your existing client)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODO: Refactor this page to use Supabase Auth via context or client-side fetch. If you need user info, use useSupabaseUser() or pass user_id from client.

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // Fetch chat directly from Supabase
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .single();
  if (chatError || !chat) {
    notFound();
  }

  // Fetch messages directly from Supabase
  const { data: messagesFromDb, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });
  if (messagesError) throw messagesError;

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility}
          isReadonly={true}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={true}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
