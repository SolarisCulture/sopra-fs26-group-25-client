export interface Lobby {
  lobbyCode: string;
  hostId: number;
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
  theme: "",
  customTheme: "",
  customWordList: "",
  difficulty: "all",
  spymasterTimer: 90,
  spyTimer: null,
  roundsNumber: null,
};
