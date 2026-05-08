import { User } from "./user";

export interface Lobby {
  lobbyCode: string;
  hostId: number;
  players: User[];
  lobbyStatus: "WAITING" | "IN_PROGRESS" | "FINISHED";
  settings?: BackendLobbySettings;
}

export interface BackendLobbySettings {
  rounds: number;
  spymasterTimeLimit: number | null;
  spyTimeLimit: number | null;
}

export interface LobbySettings {
  theme: string[];
  customWordList: string,
  spymasterTimer: number | null;
  spyTimer: number | null;
  roundsNumber:number | null,
}

export const DEFAULT_SETTINGS: LobbySettings = {
  theme: ["standard"],
  customWordList: "",
  spymasterTimer: null,
  spyTimer: null,
  roundsNumber: null,
};
