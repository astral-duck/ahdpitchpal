import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all downvoted messages with question and original answer
export async function GET(req: NextRequest) {
  // Join votes with messages table (replace 'messages' with your actual table)
  const { data, error } = await supabase
    .from('votes')
    .select(`id, chat_id, message_id, user_id, type, messages:message_id (question, original_answer)`) // adjust fields as needed
    .eq('type', 'down');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Flatten the response for frontend
  const result = (data || []).map((vote: any) => ({
    id: vote.id,
    chat_id: vote.chat_id,
    message_id: vote.message_id,
    user_id: vote.user_id,
    question: vote.messages?.question || vote.message_id,
    original_answer: vote.messages?.original_answer || '',
  }));
  return NextResponse.json(result);
}
