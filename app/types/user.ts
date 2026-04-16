export interface User {
  id: string | null;
  username: string | null;
  token: string | null;
  isHost?: boolean;
  team?: "RED" | "BLUE" | "UNASSIGNED";
  role: "SPYMASTER" | "SPY" | "NONE";
}
