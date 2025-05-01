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
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { verifySupabaseServerAuth } from '@/lib/verifySupabaseServer';
import { systemPrompt } from '@/lib/ai/prompts';

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Removed legacy Database import. Using Supabase directly.

const getAccessTokenFromRequest = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// PATCHED: Robust error handling for chatbot_settings and RAG chunks queries
export async function POST(request: Request) {
  // 1. Verify Supabase JWT (keep this for security)
  let user;
  try {
    const authResult = await verifySupabaseServerAuth(request);
    user = authResult.user;
    console.log('[POST /api/chat] Auth success:', user);
  } catch (e) {
    console.error('[POST /api/chat] Auth error:', e, { headers: Object.fromEntries(request.headers.entries()) });
    // Always return a JSON error for consistency
    return new Response(JSON.stringify({ error: 'Unauthorized', details: String(e) }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  // 2. Hardcode the model for now, minimal reference-repo logic
  const model = 'grok-2';
  const sysPrompt = 'You are AHD Answers, the dedicated bot for the sales guys at American Home Design. Your job is to equip the team with quick, reliable info on products, pricing, and installation details so they can nail every pitch and close deals on the spot.';

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON', details: String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const messages = body.messages || [];

  // --- USE OFFICIAL XAI STREAMING API ---
  // Only use this path for xAI models (grok-*), fallback to old logic otherwise
  if (model.startsWith('grok')) {
    try {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing XAI_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
      // Build messages in xAI format
      const xaiMessages = [
        { role: 'system', content: sysPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];
      const stream = await openai.chat.completions.create({
        model: 'grok-2-1212',
        messages: xaiMessages,
        stream: true
      });
      // Convert the async iterable (stream) to a ReadableStream for Next.js, as NDJSON (no data: prefix)
      const readable = new ReadableStream({
        async start(controller) {
          let chunkCount = 0;
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            console.log(`[POST /api/chat] Raw chunk #${chunkCount + 1}:`, JSON.stringify(chunk));
            if (content) {
              chunkCount++;
              const ndjson = JSON.stringify(chunk) + '\n';
              console.log(`[POST /api/chat] NDJSON content chunk #${chunkCount}:`, ndjson);
              console.log(`[POST /api/chat] Delta content #${chunkCount}:`, content);
              controller.enqueue(new TextEncoder().encode(ndjson));
            }
            // Skip non-content chunks (e.g., only role or finish_reason)
          }
          controller.close();
        }
      });
      const response = new Response(readable, { status: 200 });
      response.headers.set('Content-Type', 'application/x-ndjson');
      response.headers.set('Cache-Control', 'no-cache');
      return response;
    } catch (e) {
      console.error('[POST /api/chat] xAI stream error:', e);
      return new Response(JSON.stringify({ error: 'xAI stream error', details: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // --- FALLBACK: Old logic for non-xAI models ---
  let result;
  try {
    result = await streamText({
      model,
      system: sysPrompt,
      messages,
      maxTokens: 512,
      stream: true,
    });
    console.log('[POST /api/chat] streamText result:', result, { model, sysPrompt, messages });
    if (result && result.baseStream && typeof result.baseStream.getReader === 'function') {
      console.log('[POST /api/chat] Detected baseStream on streamText result, passing to createDataStreamResponse.');
      // --- Diagnostic: Log every chunk from the stream before sending ---
      const originalStream = result.baseStream;
      const loggedStream = new ReadableStream({
        async start(controller) {
          const reader = originalStream.getReader();
          let chunkCount = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunkCount++;
            try {
              let text: string;
              if (typeof value === 'string') {
                text = value;
              } else {
                text = new TextDecoder().decode(value);
              }

              let ndjsonLine: string | null = null;
              try {
                const parsed = JSON.parse(text);
                const delta = parsed?.choices?.[0]?.delta;
                if (delta && delta.role === 'assistant' && typeof delta.content === 'string') {
                  ndjsonLine = JSON.stringify({
                    choices: [
                      {
                        delta: {
                          role: delta.role,
                          content: delta.content,
                        },
                      },
                    ],
                  });
                } else {
                  // If the structure is not as expected, just forward the parsed chunk for debugging
                  ndjsonLine = JSON.stringify(parsed);
                }
              } catch (err) {
                // If parsing fails, send the raw text as a string for debugging
                ndjsonLine = JSON.stringify({ error: 'Could not parse chunk', raw: text });
              }
              console.log(`[POST /api/chat] Streaming chunk #${chunkCount}:`, ndjsonLine);
              controller.enqueue(new TextEncoder().encode(ndjsonLine + '\n'));
            } catch (err) {
              const errorLine = JSON.stringify({ error: '[un-decodable chunk]', details: String(err) });
              controller.enqueue(new TextEncoder().encode(errorLine + '\n'));
            }
          }
          if (chunkCount === 0) {
            console.warn('[POST /api/chat] WARNING: No chunks were streamed from baseStream!');
          }
          controller.close();
        }
      });
      // Explicitly set Content-Type for streaming (SSE/NDJSON)
      const streamResponse = createDataStreamResponse(loggedStream);
      streamResponse.headers.set('Content-Type', 'application/x-ndjson'); // Changed from 'text/event-stream'
      return streamResponse;
    }
    // Validate that result is an async iterable or has the correct streaming interface
    if (!result || (typeof result !== 'object' && typeof result[Symbol.asyncIterator] !== 'function' && typeof result[Symbol.iterator] !== 'function')) {
      console.error('[POST /api/chat] Invalid streamText result:', result);
      throw new Error('streamText did not return a valid async iterable or ReadableStream for streaming');
    }
    // LOG EACH CHUNK IN THE STREAM (fallback, legacy)
    if (typeof result[Symbol.asyncIterator] === 'function') {
      let chunkCount = 0;
      for await (const chunk of result) {
        console.log(`[POST /api/chat] Streaming chunk #${++chunkCount}:`, chunk);
        // Optionally: break after first chunk to avoid consuming the stream
        if (chunkCount === 1) break;
      }
    }
  } catch (e) {
    console.error('[POST /api/chat] streamText error:', e, { model, sysPrompt, messages });
    return new Response(JSON.stringify({ error: 'Chat model error', details: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  console.log('[POST /api/chat] Returning data stream response.');
  return createDataStreamResponse(result);
}

export async function DELETE(request: Request) {
  // ... DELETE handler ...
  return new Response('Deleted', { status: 200 }); // Placeholder
}
