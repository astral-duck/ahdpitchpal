import { createClient } from '@supabase/supabase-js';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';

// GET /api/history?limit=20
export async function GET(request: Request) {
  let user, token;
  try {
    ({ user, token } = await verifySupabaseServerAuth(request));
    console.log('[API /history] Authenticated user:', user.id, user.email);
  } catch (e) {
    console.error('[API /history] Auth error:', e);
    return new Response(JSON.stringify({ error: 'Unauthorized: ' + String(e) }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Pass the JWT to the Supabase client for RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  try {
    // Fetch chats for the authenticated user
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    console.log('[API /history] Query result:', chats, error);

    // Robust error handling for empty result and 406
    if (error) {
      // Distinguish RLS/permission errors
      if (error.code === '42501' || error.message?.toLowerCase().includes('permission')) {
        return new Response(JSON.stringify({ error: 'Permission denied: ' + error.message }), { status: 403 });
      }
      // Handle 406 Not Acceptable as 'no chats yet' instead of error
      if (error.code === '40600' || error.message?.toLowerCase().includes('acceptable')) {
        return Response.json({ chats: [] });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // If chats is null or undefined, return empty array
    return Response.json({ chats: Array.isArray(chats) ? chats : [] });
  } catch (e) {
    // Catch-all for unexpected errors
    console.error('[API /history] Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error: ' + String(e) }), { status: 500 });
  }
}
