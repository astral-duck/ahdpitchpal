import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This endpoint now expects the user id to be provided in a query param or header (since Supabase Auth is client-side only)
// Removed legacy Database import. Using Supabase directly.

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');
  const userId = searchParams.get('user_id') || request.headers.get('x-user-id');

  if (startingAfter && endingBefore) {
    return Response.json(
      'Only one of starting_after or ending_before can be provided!',
      { status: 400 },
    );
  }

  if (!userId) {
    return Response.json('Unauthorized! Missing user_id.', { status: 401 });
  }

  try {
    // Fetch chats directly from Supabase
    let query = supabase
      .from('chats')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (startingAfter) {
      query = query.lt('id', startingAfter);
    } else if (endingBefore) {
      query = query.gt('id', endingBefore);
    }

    query = query.limit(limit);

    const { data: chats, error } = await query;
    if (error) throw error;

    return Response.json(chats);
  } catch (_) {
    return Response.json('Failed to fetch chats!', { status: 500 });
  }
}
