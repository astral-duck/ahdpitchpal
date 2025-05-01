'use client';

import type { Attachment, UIMessage } from 'ai';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { fetchWithSupabaseAuth } from '@/lib/fetchWithSupabaseAuth';
import { useSupabaseUser } from '@/components/supabase-user-context';
import { streamChatApi } from '@/lib/stream-chat';
import { useRef } from 'react';

// Define a valid UIMessage type for all assistant/user messages
function createUIMessage({ id, role, content, createdAt, attachments }: {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  attachments?: any[];
}): UIMessage {
  return {
    id: id || generateUUID(),
    role,
    content,
    createdAt: createdAt || new Date(),
    attachments: attachments || [],
  };
}

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const [messages, setMessages] = useState<Array<UIMessage>>(initialMessages);
  const [input, setInput] = useState('');
  type ChatStatus = 'streaming' | 'error' | 'submitted' | 'ready';
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const { user, loading } = useSupabaseUser();
  const shouldFetchVotes = messages.length >= 2 && user && !loading;
  const { data: votes } = useSWR<Array<Vote>>(
    shouldFetchVotes ? `/api/vote?chatId=${id}` : null,
    (url: string) => fetchWithSupabaseAuth(url).then(res => res.json()),
  );
  const streamingRef = useRef<AbortController | null>(null);

  useEffect(() => {
    console.log('[ChatComponent] messages state updated', messages);
  }, [messages]);

  // Streaming chat submit handler with robust assistant message accumulation
  async function handleStreamedChatSubmit(e?: React.FormEvent) {
    console.log('[handleStreamedChatSubmit] called');
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!input.trim() || status === 'streaming') {
      console.log('[handleStreamedChatSubmit] blocked: input empty or already streaming', { input, status });
      return;
    }
    setStatus('streaming');
    const userMessage = createUIMessage({
      role: 'user',
      content: input,
    });
    setMessages(prev => {
      const updated = [...prev, userMessage];
      console.log('[handleStreamedChatSubmit] setMessages (user)', updated);
      return updated;
    });
    setInput('');

    const controller = new AbortController();
    streamingRef.current = controller;
    try {
      console.log('[handleStreamedChatSubmit] submitting to streamChatApi', {
        url: '/api/chat',
        body: { messages: [...messages, userMessage] },
      });
      let assistantId = generateUUID();
      let assistantContent = '';
      // Add an empty assistant message for streaming
      setMessages(prev => {
        const updated = [
          ...prev,
          createUIMessage({
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: new Date(),
          }),
        ];
        console.log('[handleStreamedChatSubmit] setMessages (assistant placeholder)', updated);
        return updated;
      });
      for await (const chunk of streamChatApi({
        url: '/api/chat',
        body: { messages: [...messages, userMessage] },
        signal: controller.signal,
      })) {
        console.log('[handleStreamedChatSubmit] received chunk', chunk);
        const delta = chunk?.choices?.[0]?.delta;
        if (delta && delta.role === 'assistant' && typeof delta.content === 'string') {
          assistantContent += delta.content;
          console.log('[handleStreamedChatSubmit] assistant message content updated:', assistantContent);
          setMessages(prevMsgs => {
            // Find the last assistant message with the streaming assistantId
            const idx = prevMsgs.findIndex(
              (msg) => msg.id === assistantId && msg.role === 'assistant'
            );
            if (idx !== -1) {
              const updated = [
                ...prevMsgs.slice(0, idx),
                {
                  ...prevMsgs[idx],
                  content: assistantContent,
                  parts: [{ type: 'text', text: assistantContent }],
                },
                ...prevMsgs.slice(idx + 1),
              ];
              return updated;
            } else {
              // Fallback: append a new assistant message if not found (should not happen)
              return [
                ...prevMsgs,
                createUIMessage({
                  id: assistantId,
                  role: 'assistant',
                  content: assistantContent,
                  createdAt: new Date(),
                  parts: [{ type: 'text', text: assistantContent }],
                }),
              ];
            }
          });
        }
      }
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      let errorMessage = 'An error occurred, please try again!';
      if (err && typeof err === 'object') {
        if ('status' in err && err.status === 401) {
          errorMessage = 'Unauthorized: Please log in again.';
        } else if ('status' in err && err.status === 400) {
          errorMessage = 'Invalid request sent to the server.';
        } else if ('message' in err && err.message) {
          errorMessage = `Error: ${err.message}`;
        }
      }
      toast.error(errorMessage);
      console.error('[handleStreamedChatSubmit] Chat stream error:', err);
    } finally {
      streamingRef.current = null;
      console.log('[handleStreamedChatSubmit] finished');
    }
  }

  function stopStreaming() {
    if (streamingRef.current) {
      streamingRef.current.abort();
      streamingRef.current = null;
      setStatus('idle');
    }
  }

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />
        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={() => {}}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />
        <form
          className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
          onSubmit={handleStreamedChatSubmit}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleStreamedChatSubmit}
              status={status}
              stop={stopStreaming}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={() => {}}
            />
          )}
        </form>
      </div>
      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleStreamedChatSubmit}
        status={status}
        stop={stopStreaming}
        attachments={attachments}
        setAttachments={setAttachments}
        append={() => {}}
        messages={messages}
        setMessages={setMessages}
        reload={() => {}}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
