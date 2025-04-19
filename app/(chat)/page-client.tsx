"use client";
import ChatPageClient from './chat-page-client';

export default function PageClient({ modelIdFromCookie }: { modelIdFromCookie?: string }) {
  return <ChatPageClient modelIdFromCookie={modelIdFromCookie} />;
}
