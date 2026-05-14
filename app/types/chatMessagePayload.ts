interface ChatMessagePayload {
  type: "CHAT_MESSAGE";
  senderId: number;
  senderName: string;
  content: string;
  team: "RED" | "BLUE";
  timestamp: string;
}