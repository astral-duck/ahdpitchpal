import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UpdateDocumentProps {
  session: any;
  dataStream: DataStreamWriter;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      // Fetch document directly from Supabase
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id);
      if (docError || !documents || documents.length === 0) {
        return {
          error: 'Document not found',
        };
      }
      const document = documents[0];

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });

      // Save updated document to Supabase (if needed)
      // await supabase.from('documents').update({ ... }).eq('id', id);

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
    },
  });
