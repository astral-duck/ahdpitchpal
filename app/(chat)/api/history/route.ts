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
  } catch (e) {
    console.error('[API /history] Auth error:', e);
    return new Response(JSON.stringify({ error: 'Unauthorized: ' + String(e) }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    // Fetch chats for the authenticated user
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Log error details for debugging
      console.error('[API /history] Supabase error:', error);
      // Distinguish RLS/permission errors
      if (error.code === '42501' || error.message.toLowerCase().includes('permission')) {
        return new Response(JSON.stringify({ error: 'Permission denied: ' + error.message }), { status: 403 });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return Response.json({ chats: chats || [] });
  } catch (e) {
    // Catch-all for unexpected errors
    console.error('[API /history] Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error: ' + String(e) }), { status: 500 });
  }
}
