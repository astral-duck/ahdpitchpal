import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verifies the Supabase JWT from the Authorization header and returns the user.
 * Throws if invalid or missing.
 */
export async function verifySupabaseServerAuth(request: Request): Promise<{ user: any }> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) throw new Error('Missing auth token');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('Invalid auth token');
  return { user: data.user };
}
