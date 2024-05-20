declare interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

declare interface ChatSession {
  id: string;
  lastActive: number;
  messages: ChatMessage[];
}
