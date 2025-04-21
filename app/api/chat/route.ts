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

    // 1. Fetch chatbot settings from Supabase
    const { data: settings, error: settingsError } = await supabase
      .from('chatbot_settings')
      .select('instructions, model')
      .eq('id', 1)
      .single();
    if (settingsError || !settings) {
      return new Response('Failed to fetch chatbot settings', { status: 500 });
    }

    // 2. Retrieve relevant RAG context from rag_chunks (simple keyword search for demo)
    const query = userMessage.content;
    let ragContext = '';
    const { data: ragChunks, error: ragError } = await supabase
      .from('rag_chunks')
      .select('content')
      .ilike('content', `%${query.split(' ')[0] || ''}%`)
      .limit(5);
    if (!ragError && ragChunks && ragChunks.length > 0) {
      ragContext = ragChunks.map((chunk: any) => chunk.content).join('\n---\n');
    }

    // 3. Construct system prompt
    const sysPrompt = [
      settings.instructions,
      ragContext ? `Knowledge Base:\n${ragContext}` : '',
    ].filter(Boolean).join('\n\n');

    // 4. Call the LLM (xAI/Grok) and stream response
    const stream = await streamText({
      model: myProvider.languageModel(settings.model || selectedChatModel || 'chat-model'),
      system: sysPrompt,
      prompt: userMessage.content,
      messages,
      maxTokens: 512,
    });
    return createDataStreamResponse(smoothStream(stream));
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // ... DELETE handler ...
  return new Response('Deleted', { status: 200 }); // Placeholder
}
