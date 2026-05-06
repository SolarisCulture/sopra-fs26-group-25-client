import { User } from "./user";

export interface Lobby {
  lobbyCode: string;
  hostId: number;
  players: User[];
  lobbyStatus: "WAITING" | "IN_PROGRESS" | "FINISHED";
}

export interface LobbySettings {
  theme: string[];
  customTheme: string;
  customWordList: string,
  spymasterTimer: number | null;
  spyTimer: number | null;
  roundsNumber:number | null,
}

export const DEFAULT_SETTINGS: LobbySettings = {
  theme: ["standard"],
  customTheme: "",
  customWordList: "",
  spymasterTimer: null,
  spyTimer: null,
  roundsNumber: 1000,
};
