import { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';

// This endpoint now expects the user id to be provided in a query param or header (since Supabase Auth is client-side only)

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
    const chats = await getChatsByUserId({
      id: userId,
      limit,
      startingAfter,
      endingBefore,
    });

    return Response.json(chats);
  } catch (_) {
    return Response.json('Failed to fetch chats!', { status: 500 });
  }
}
