'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getSuggestions({ documentId }: { documentId: string }) {
  // Fetch suggestions directly from Supabase
  const { data: suggestions, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('documentId', documentId);
  if (error) throw error;
  return suggestions ?? [];
}

// Removed legacy Database import. Using Supabase directly.
