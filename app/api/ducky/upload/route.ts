import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const apiKey = process.env.DUCKY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DUCKY_API_KEY not set" }, { status: 500 });
  }

  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Ducky.ai expects: file, title (optional), metadata (optional)
  const uploadRes = await fetch("https://api.ducky.ai/v1/documents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
      // Note: Do NOT set Content-Type for multipart/form-data fetch, browser/edge will set it automatically
    },
    body: (() => {
      const fd = new FormData();
      fd.append("file", file, (file as File).name || "upload.txt");
      return fd;
    })(),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return NextResponse.json({ error: text }, { status: uploadRes.status });
  }
  const data = await uploadRes.json();
  return NextResponse.json({ document: data });
}
