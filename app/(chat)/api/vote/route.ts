import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODO: Refactor this API to use Supabase Auth JWT from Authorization header or user_id in request body/query.

export async function GET(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();
  if (chatError || !chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('*')
    .eq('chatId', chatId);
  if (votesError) throw votesError;

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();
  if (chatError || !chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Upsert vote
  const { error: voteError } = await supabase
    .from('votes')
    .upsert({
      chatId,
      messageId,
      type,
      userId: user.id,
      updatedAt: new Date(),
    });
  if (voteError) throw voteError;

  return new Response('Vote updated', { status: 200 });
}
