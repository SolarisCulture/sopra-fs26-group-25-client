export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  team: "red" | "blue";
  timeStamp: string;
}
