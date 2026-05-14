export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  // team: "red" | "blue"; => Removed since it's a global chat?
  timeStamp: string;
}
