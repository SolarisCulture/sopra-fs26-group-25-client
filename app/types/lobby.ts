import { User } from "./user";

export interface Lobby {
  lobbyCode: string;
  hostId: number;
  players: User[];
  lobbyStatus: "WAITING" | "IN_PROGRESS" | "FINISHED";
}

export interface LobbySettings {
  theme: string;
  customTheme: string;
  customWordList: string,
  difficulty: "easy" | "medium" | "hard" | "all";
  spymasterTimer: number | null;
  spyTimer: number | null;
  roundsNumber:number | null,
}

export const DEFAULT_SETTINGS: LobbySettings = {
  theme: "standard",
  customTheme: "",
  customWordList: "",
  difficulty: "all",
  spymasterTimer: null,
  spyTimer: null,
  roundsNumber: 1000,
};
