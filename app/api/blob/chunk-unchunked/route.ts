import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chunkAndEmbedFile } from "@/lib/chunkingPipeline";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// export const runtime = "edge"; // Comment out for better logging in Node.js runtime

export async function POST(req: NextRequest) {
  console.log("[chunk-unchunked] POST endpoint triggered");
  try {
    // 1. Fetch all blob files from API
    const blobListRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/blob/list`);
    if (!blobListRes.ok) {
      const errText = await blobListRes.text();
      console.error("[chunk-unchunked] Failed to fetch blob list:", errText);
      return NextResponse.json({ success: false, error: "Failed to fetch blob list: " + errText }, { status: 500 });
    }
    const { files } = await blobListRes.json();
    // 2. Get already chunked files from Supabase
    const { data: chunked, error: err1 } = await supabase
      .from("rag_chunks")
      .select("file_name");
    if (err1) {
      console.error("[chunk-unchunked] Supabase error:", err1);
      return NextResponse.json({ success: false, error: err1.message }, { status: 500 });
    }
    const chunkedFiles = chunked ? [...new Set(chunked.map((f: { file_name: string }) => f.file_name))] : [];
    // 3. Find unchunked files by file_name
    const unchunkedBlobs = files.filter((f: { key: string }) => !chunkedFiles.includes(f.key.split("-")[0] + ".txt"));
    let results = [];
    for (const blob of unchunkedBlobs) {
      const fileName = blob.key.split("-")[0] + ".txt"; // for display/metadata
      console.log("[chunk-unchunked] Processing file:", fileName, blob.url);
      try {
        const result = await chunkAndEmbedFile({ fileName, fileUrl: blob.url, filePath: blob.key });
        results.push({ fileName, url: blob.url, success: true, result });
      } catch (e) {
        console.error("[chunk-unchunked] Error processing file:", fileName, e);
        results.push({ fileName, url: blob.url, success: false, error: (e as Error).message });
      }
    }
    console.log("[chunk-unchunked] All results:", results);
    return NextResponse.json({ success: true, chunked: unchunkedBlobs.length, results });
  } catch (e) {
    console.error("[chunk-unchunked] Unexpected error:", e);
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
