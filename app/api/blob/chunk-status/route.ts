import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = "edge";

export async function GET(req: NextRequest) {
  // Get all chunks from rag_chunks
  const { data: chunks, error } = await supabase
    .from("rag_chunks")
    .select("id, file_name, chunk_index, content, created_at")
    .order("file_name", { ascending: true })
    .order("chunk_index", { ascending: true });

  if (error) {
    return NextResponse.json({ status: "Error: " + error.message }, { status: 500 });
  }
  if (!chunks || chunks.length === 0) {
    return NextResponse.json({ status: "No chunks found. No files processed yet.", chunks: [] });
  }
  return NextResponse.json({ status: `Found ${chunks.length} chunks.`, chunks });
}
