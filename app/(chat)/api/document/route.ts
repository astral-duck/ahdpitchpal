import type { ArtifactKind } from '@/components/artifact';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

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
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const documentsResponse = await supabase
    .from('documents')
    .select('*')
    .eq('id', id);
  if (documentsResponse.error) throw documentsResponse.error;
  const documents = documentsResponse.data || [];

  const [document] = documents;

  if (!document) {
    return new Response('Not found', { status: 404 });
  }

  if (document.userId !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  // Save or update document in Supabase
  const { error: saveError } = await supabase
    .from('documents')
    .upsert({
      id,
      userId: user.id,
      content,
      title,
      kind,
      updatedAt: new Date(),
    });
  if (saveError) throw saveError;

  return new Response('Document saved', { status: 200 });
}

export async function DELETE(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  if (!timestamp) {
    return new Response('Missing timestamp', { status: 400 });
  }

  // Delete all documents after this document's createdAt
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id);
  if (docsError || !docs || docs.length === 0) return new Response('Not found', { status: 404 });
  const document = docs[0];

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('userId', user.id)
    .gt('createdAt', document.createdAt);
  if (deleteError) throw deleteError;

  return new Response('Documents deleted', { status: 200 });
}
