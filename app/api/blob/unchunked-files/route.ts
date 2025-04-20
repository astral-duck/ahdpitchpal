import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // For demo: Pretend we have a list of all files
    const allFiles = ["Jacuzzi bath.txt", "Out Door Living.txt", "walk-in tubs.txt", "windows.txt"];
    const { data: chunked, error } = await supabase
      .from("rag_chunks")
      .select("file_name");
    if (error) {
      console.error("[unchunked-files] Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    // Deduplicate file names
    const chunkedFiles = chunked ? [...new Set(chunked.map(f => f.file_name))] : [];
    const unchunkedFiles = allFiles.filter(f => !chunkedFiles.includes(f));
    return NextResponse.json({ success: true, unchunkedFiles });
  } catch (e) {
    console.error("[unchunked-files] Unexpected error:", e);
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
