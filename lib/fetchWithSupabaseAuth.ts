import { supabase } from './supabaseClient';

/**
 * Fetch wrapper that automatically adds the Supabase access token to the Authorization header.
 * Falls back to normal fetch if no user/session is available.
 */
export async function fetchWithSupabaseAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(input, { ...init, headers });
}
