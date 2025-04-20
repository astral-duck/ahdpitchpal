import { createClient } from '@supabase/supabase-js';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/history?limit=20
export async function GET(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Fetch chats for the authenticated user
  const { data: chats, error } = await supabase
    .from('chats')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return Response.json({ chats: chats || [] });
}
