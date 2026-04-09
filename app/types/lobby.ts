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
  roundTimer: number | null;
  roundsNumber:number | null,
}

export const DEFAULT_SETTINGS: LobbySettings = {
  theme: "",
  customTheme: "",
  customWordList: "",
  difficulty: "all",
  roundTimer: 90,
  roundsNumber: null,
};
