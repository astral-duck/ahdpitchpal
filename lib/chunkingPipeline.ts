import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OpenAI embedding API endpoint and key from .env
const OPENAI_EMBEDDING_ENDPOINT = "https://api.openai.com/v1/embeddings";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- BEGIN: Legacy chunking/embedding pipeline commented out ---
/*
export async function chunkAndEmbedFile({ fileName, fileUrl, filePath }: { fileName: string; fileUrl: string; filePath: string }) {
  console.log("[chunkAndEmbedFile] Starting for:", fileName, fileUrl, filePath);
  // Download file content
  const res = await fetch(fileUrl);
  if (!res.ok) {
    console.error(`[chunkAndEmbedFile] Failed to fetch file: ${fileUrl} status: ${res.status}`);
    throw new Error(`Failed to fetch file: ${fileUrl} status: ${res.status}`);
  }
  const text = await res.text();
  console.log(`[chunkAndEmbedFile] Downloaded file (${text.length} chars)`);

  // Chunk text (simple split by N chars, can be improved)
  const chunkSize = 1000;
  const overlap = 200;
  const chunks: { content: string; chunk_index: number }[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.substring(i, i + chunkSize);
    chunks.push({ content: chunk, chunk_index: chunks.length });
    i += chunkSize - overlap;
  }
  console.log(`[chunkAndEmbedFile] Created ${chunks.length} chunks.`);

  // Embed and insert into Supabase
  for (const { content, chunk_index } of chunks) {
    try {
      // Call OpenAI embedding API
      const embeddingPayload = {
        model: "text-embedding-ada-002",
        input: content
      };
      console.log("[chunkAndEmbedFile] Embedding request payload:", embeddingPayload);
      const embeddingRes = await fetch(OPENAI_EMBEDDING_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(embeddingPayload)
      });
      console.log(`[chunkAndEmbedFile] Embedding API status:`, embeddingRes.status);
      let embeddingJson;
      try {
        embeddingJson = await embeddingRes.json();
      } catch (jsonErr) {
        console.error("[chunkAndEmbedFile] Failed to parse embedding API response as JSON", jsonErr);
        throw new Error("Failed to parse embedding API response as JSON: " + String(jsonErr));
      }
      console.log("[chunkAndEmbedFile] Embedding API response:", embeddingJson);
      if (!embeddingJson.data || !Array.isArray(embeddingJson.data) || !embeddingJson.data[0]) {
        console.error("[chunkAndEmbedFile] Embedding API returned unexpected response:", embeddingJson);
        throw new Error("Embedding API returned unexpected response: " + JSON.stringify(embeddingJson));
      }
      const embedding = embeddingJson.data[0].embedding;
      // Insert chunk
      const { error: insertError } = await supabase.from("rag_chunks").insert({
        file_name: fileName,
        file_path: filePath,
        chunk_index,
        content,
        embedding,
        source_type: "blob_upload"
      });
      if (insertError) {
        console.error(`[chunkAndEmbedFile] Supabase insert error:`, insertError);
        throw new Error(`Supabase insert error: ${insertError.message}`);
      }
      console.log(`[chunkAndEmbedFile] Inserted chunk ${chunk_index}`);
    } catch (err) {
      console.error(`[chunkAndEmbedFile] Embedding or insert failed for chunk ${chunk_index}:`, err);
      throw err;
    }
  }
  return { chunkCount: chunks.length };
}
*/
// --- END: Legacy chunking/embedding pipeline commented out ---
