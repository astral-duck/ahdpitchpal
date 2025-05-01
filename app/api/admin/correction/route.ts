import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Save a correction and remove the vote atomically
export async function POST(req: NextRequest) {
  const { question, original_answer, corrected_answer, vote_id } = await req.json();
  if (!question || !original_answer || !corrected_answer || !vote_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Insert correction
  const { data: correction, error: insertError } = await supabase
    .from('training_corrections')
    .insert({
      question,
      original_answer,
      corrected_answer,
      completed: false,
    });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  // Remove vote
  const { error: deleteError } = await supabase
    .from('votes')
    .delete()
    .eq('id', vote_id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
