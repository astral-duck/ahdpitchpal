import { customProvider } from "ai";
import { xai } from "@ai-sdk/xai";

export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export const myProvider = customProvider({
  languageModels: {
    // Internal model ID -> Provider model mapping
    "chat-model": xai("grok-2-1212"), // Maps 'chat-model' to Grok 2
    // Add more mappings as needed
  },
  imageModels: {
    // Example: "small-model": xai.image("grok-2-image")
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat (Grok 2)',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];
