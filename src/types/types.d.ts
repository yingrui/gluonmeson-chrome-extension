declare interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}
