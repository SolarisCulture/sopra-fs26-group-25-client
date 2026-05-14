export interface BackendChatMessage {
  senderName: string;
  content: string;
  timestamp: string;
  team?: "RED" | "BLUE";
}