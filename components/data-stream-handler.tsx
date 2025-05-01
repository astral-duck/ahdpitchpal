'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { artifactDefinitions, ArtifactKind } from './artifact';
import { Suggestion } from '@/lib/db/schema';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind';
  content: string | Suggestion;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta, idx) => {
      try {
        if (!delta || typeof delta !== 'object') {
          console.warn('[DataStreamHandler] Skipping invalid delta:', delta);
          return;
        }
        if (!delta.type) {
          console.warn('[DataStreamHandler] Delta missing type:', delta);
          return;
        }
        const artifactDefinition = artifactDefinitions.find(
          (artifactDefinition) => artifactDefinition.kind === artifact.kind,
        );

        if (artifactDefinition?.onStreamPart) {
          artifactDefinition.onStreamPart({
            streamPart: delta,
            setArtifact,
            setMetadata,
          });
        }

        setArtifact((draftArtifact) => {
          if (!draftArtifact) {
            return { ...initialArtifactData, status: 'streaming' };
          }

          switch (delta.type) {
            case 'id':
              return {
                ...draftArtifact,
                documentId: delta.content as string,
                status: 'streaming',
              };
            case 'title':
              return {
                ...draftArtifact,
                title: delta.content as string,
                status: 'streaming',
              };
            case 'kind':
              return {
                ...draftArtifact,
                kind: delta.content as ArtifactKind,
                status: 'streaming',
              };
            case 'clear':
              return {
                ...draftArtifact,
                content: '',
                status: 'streaming',
              };
            case 'finish':
              return {
                ...draftArtifact,
                status: 'idle',
              };
            default:
              if (
                delta.type.endsWith('-delta') &&
                typeof delta.content === 'string' &&
                delta.content.length > 0
              ) {
                return {
                  ...draftArtifact,
                  content: draftArtifact.content + delta.content,
                  status: 'streaming',
                };
              }
              return draftArtifact;
          }
        });
      } catch (err) {
        console.error('[DataStreamHandler] Error processing delta chunk', idx, delta, err);
      }
    });
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
}
