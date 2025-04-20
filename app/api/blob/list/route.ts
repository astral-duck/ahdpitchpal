import { NextRequest } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(req: NextRequest) {
  try {
    const { blobs } = await list();
    const files = blobs.map((blob) => ({
      key: blob.pathname,
      size: blob.size,
      contentType: blob.contentType,
      lastModified: blob.uploadedAt,
      url: blob.url,
    }));
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
