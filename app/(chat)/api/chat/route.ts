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
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
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

    // Replace legacy getChatById
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();
    if (chatError || !chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      // Replace legacy saveChat
      const { data: newChat, error: newChatError } = await supabase
        .from('chats')
        .insert({
          id,
          userId: user.id,
          title,
        })
        .single();
      if (newChatError) {
        throw newChatError;
      }
    } else {
      if (chat.userId !== user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Replace legacy saveMessages
    const { data: newMessages, error: newMessagesError } = await supabase
      .from('messages')
      .insert([
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ]);
    if (newMessagesError) {
      throw newMessagesError;
    }

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session: { user }, dataStream }),
            updateDocument: updateDocument({ session: { user }, dataStream }),
            requestSuggestions: requestSuggestions({ session: { user }, dataStream }),
          },
          onFinish: async ({ response }) => {
            if (user.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                // Replace legacy saveMessages
                const { data: savedAssistantMessage, error: savedAssistantMessageError } = await supabase
                  .from('messages')
                  .insert([
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ]);
                if (savedAssistantMessageError) {
                  throw savedAssistantMessageError;
                }
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
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

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    // Replace legacy getChatById
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();
    if (chatError || !chat) {
      return new Response('Not found', { status: 404 });
    }

    if (chat.userId !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Replace legacy deleteChatById
    const { error: deleteChatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);
    if (deleteChatError) {
      throw deleteChatError;
    }

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
