export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  team?: "red" | "blue";  // optional for global chat but kept for styling
  timeStamp: string;
}