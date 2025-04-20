import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { chunkAndEmbedFile } from "@/lib/chunkingPipeline";

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

  // Start chunking/embedding pipeline (async, can be awaited or queued)
  const result = await chunkAndEmbedFile({
    fileName: file.name,
    fileUrl: blob.url,
    filePath: blob.pathname
  });

  return NextResponse.json({ success: true, blob, chunking: result });
}
