import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public"
  });

  // --- BEGIN: Legacy chunking/embedding trigger commented out ---
  /*
    // Start chunking/embedding pipeline (async, can be awaited or queued)
    const result = await chunkAndEmbedFile({
      fileName: file.name,
      fileUrl: blob.url,
      filePath: blob.pathname
    });
  */
  // Ducky.ai now handles chunking/embedding. No-op here.
  // --- END: Legacy chunking/embedding trigger commented out ---

  return NextResponse.json({ success: true, blob });
}
