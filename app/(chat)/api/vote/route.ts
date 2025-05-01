import { createClient } from '@supabase/supabase-js';
// Removed legacy Database import. Using Supabase directly.
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';

function getAccessTokenFromRequest(request: Request): string | undefined {
  const authHeader = request.headers.get('authorization') || '';
  return authHeader.startsWith('Bearer ')
    ? authHeader.substring('Bearer '.length)
    : undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  let user;
  let accessToken;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
    accessToken = getAccessTokenFromRequest(request);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    supabaseUrl!,
    supabaseAnonKey!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

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

  console.log('[VOTE API] user.id:', user.id, 'chat.userId:', chat.userId, 'chatId:', chatId);
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
  let accessToken;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
    accessToken = getAccessTokenFromRequest(request);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    supabaseUrl!,
    supabaseAnonKey!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } = await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('Missing required fields', { status: 400 });
  }

  // Confirm chat ownership
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();
  if (chatError || !chat) {
    return new Response('Chat not found', { status: 404 });
  }
  console.log('[VOTE API] user.id:', user.id, 'chat.userId:', chat.userId, 'chatId:', chatId);
  if (chat.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Upsert vote
  const { data: vote, error: voteError } = await supabase
    .from('votes')
    .upsert({ chatId, messageId, type, userId: user.id }, { onConflict: 'chatId,messageId,userId' })
    .select()
    .single();
  if (voteError) throw voteError;

  return Response.json(vote, { status: 200 });
}
