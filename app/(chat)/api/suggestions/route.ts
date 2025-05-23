// TODO: Refactor this API to use Supabase Auth JWT from Authorization header or user_id in request body/query.

import { createClient } from '@supabase/supabase-js';
// Removed legacy Database import. Using Supabase directly.
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';

function getAccessTokenFromRequest(request: Request): string | undefined {
  const authHeader = request.headers.get('authorization') || '';
  return authHeader.startsWith('Bearer ')
    ? authHeader.substring('Bearer '.length)
    : undefined;
}

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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new Response('Not Found', { status: 404 });
  }

  // Fetch suggestions directly from Supabase
  const { data: suggestions, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('documentId', documentId);
  if (error) throw error;

  const [suggestion] = suggestions || [];

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (suggestion.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(suggestions, { status: 200 });
}
