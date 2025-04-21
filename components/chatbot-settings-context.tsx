"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Only require model in context
interface ChatbotSettings {
  model: string;
}

const ChatbotSettingsContext = createContext<ChatbotSettings>({ model: "grok-1.5rag" });

export function useChatbotSettings() {
  return useContext(ChatbotSettingsContext);
}

// Global cache for chatbot settings
let cachedModel: string | null = null;
let lastFetched: number | null = null;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getNextCentral3AM(now: Date): Date {
  // Central Time = UTC-5 or UTC-6 depending on DST; for simplicity, use UTC-5
  // This is a rough approximation; for production, use a timezone lib
  const centralOffset = 5 * 60; // minutes
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const central = new Date(utc.getTime() - centralOffset * 60000);
  central.setHours(3, 0, 0, 0);
  if (central <= now) {
    central.setDate(central.getDate() + 1);
  }
  return central;
}

export function ChatbotSettingsProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<string>(cachedModel || "grok-1.5rag");

  useEffect(() => {
    async function fetchModelIfNeeded() {
      const now = new Date();
      const next3am = getNextCentral3AM(now);
      // Only fetch if never fetched, or it's after 3am central and last fetch was before last 3am
      if (!cachedModel || !lastFetched || lastFetched < next3am.getTime() - ONE_DAY_MS) {
        const { data } = await supabase
          .from("chatbot_settings")
          .select("model")
          .eq("id", 1)
          .single();
        if (data && data.model) {
          cachedModel = data.model;
          lastFetched = now.getTime();
          setModel(data.model);
        } else {
          cachedModel = "grok-1.5rag";
          setModel("grok-1.5rag");
        }
      }
    }
    fetchModelIfNeeded();
    // Set interval to check again at next 3am
    const now = new Date();
    const next3am = getNextCentral3AM(now);
    const msUntil3am = next3am.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      fetchModelIfNeeded();
    }, msUntil3am);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ChatbotSettingsContext.Provider value={{ model }}>
      {children}
    </ChatbotSettingsContext.Provider>
  );
}
