import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';
import { systemPrompt } from '@/lib/ai/prompts';

import { createClient } from '@supabase/supabase-js';

// Removed legacy Database import. Using Supabase directly.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODO: Refactor this API to use Supabase Auth JWT from Authorization header or user_id in request body/query.

export const maxDuration = 60;

export async function POST(request: Request) {
  let user;
  try {
    ({ user } = await verifySupabaseServerAuth(request));
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // ... rest of the POST handler logic ...

    return new Response('OK', { status: 200 }); // Placeholder
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // ... DELETE handler ...
  return new Response('Deleted', { status: 200 }); // Placeholder
}
