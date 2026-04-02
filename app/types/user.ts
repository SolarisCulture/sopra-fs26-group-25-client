export interface User {
  id: string | null;
  username: string | null;
  token: string | null;
  isHost?: boolean;
  team?: "red" | "blue" | null;
}
