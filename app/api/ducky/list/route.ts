import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.DUCKY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DUCKY_API_KEY not set" }, { status: 500 });
  }
  try {
    const res = await fetch("https://api.ducky.ai/v1/documents", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ documents: data.documents || data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch documents from Ducky.ai" }, { status: 500 });
  }
}
