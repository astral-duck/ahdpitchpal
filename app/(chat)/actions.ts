'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { myProvider } from '@/lib/ai/providers';
import { VisibilityType } from '@/components/visibility-selector';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  // Fetch the message
  const { data: messages, error: messageError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id);
  if (messageError || !messages || messages.length === 0) return;
  const message = messages[0];

  // Delete all messages in the same chat after this message's createdAt
  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', message.chat_id)
    .gt('created_at', message.createdAt);
  if (deleteError) throw deleteError;
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  const { error: updateError } = await supabase
    .from('chats')
    .update({ visibility })
    .eq('id', chatId);
  if (updateError) throw updateError;
}
