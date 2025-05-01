import { fetchWithSupabaseAuth } from './fetchWithSupabaseAuth';
import { parseNDJSONStream } from './parseNDJSONStream';

/**
 * Stream chat API and yield parsed NDJSON objects.
 * Usage: for await (const delta of streamChatApi(...)) { ... }
 */
export async function* streamChatApi({
  url,
  body,
  signal,
}: {
  url: string;
  body: any;
  signal?: AbortSignal;
}) {
  const response = await fetchWithSupabaseAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/x-ndjson',
    },
    signal,
  });
  if (!response.body) throw new Error('No response body for stream');
  for await (const obj of parseNDJSONStream(response.body)) {
    yield obj;
  }
}
