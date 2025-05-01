import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

/**
 * Fetch wrapper that automatically adds the Supabase access token to the Authorization header.
 * Falls back to normal fetch if no user/session is available.
 */
export async function fetchWithSupabaseAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const session = await supabase.auth.getSession();
  console.log('fetchWithSupabaseAuth session:', session);
  const accessToken = session.data.session?.access_token;
  console.log('fetchWithSupabaseAuth accessToken:', accessToken);

  if (!accessToken) {
    const error = new Error('No Supabase access token found. User may not be authenticated.');
    // Optionally, you can add a custom status property for better error handling
    // @ts-ignore
    error.status = 401;
    console.error('fetchWithSupabaseAuth error:', error, { input, init });
    throw error;
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Accept', 'application/json'); // Ensure Accept header is always set

  console.log('fetchWithSupabaseAuth final fetch:', { input: input.toString(), headers: Object.fromEntries(headers.entries()), init });

  return fetch(input.toString(), { ...init, headers });
}
