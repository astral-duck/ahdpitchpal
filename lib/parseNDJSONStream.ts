/**
 * Robust NDJSON stream parser for browser fetch streams.
 * Usage: for (const obj of parseNDJSONStream(stream)) { ... }
 */
export async function* parseNDJSONStream(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return;
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          yield JSON.parse(trimmed);
        } catch (err) {
          // Log and skip malformed lines
          console.warn('[parseNDJSONStream] Skipping malformed NDJSON line:', trimmed, err);
        }
      }
    }
    // Handle any trailing line (if not empty)
    const last = buffer.trim();
    if (last) {
      try {
        yield JSON.parse(last);
      } catch (err) {
        console.warn('[parseNDJSONStream] Skipping malformed NDJSON line at end:', last, err);
      }
    }
  } catch (err) {
    console.error('[parseNDJSONStream] Stream error:', err);
  } finally {
    reader.releaseLock();
  }
}
