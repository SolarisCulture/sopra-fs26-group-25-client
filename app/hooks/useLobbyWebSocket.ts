import { useEffect } from "react";
import {
  createLobbySocket,
  LobbyEvent,
  SettingsUpdateData,
} from "@/utils/lobbyWebsocket";
import { LobbySettings } from "@/types/lobby";

interface UseLobbySocketOptions {
  lobbyCode: string;
  userID: number | null;
  fetchLobby: () => Promise<any>;
  setSettings: (fn: (prev: LobbySettings) => LobbySettings) => void;
  setIsStarting: (val: boolean) => void;
  onGameStart: () => void;
  message: any;
}

export function useLobbyWebSocket({
  lobbyCode, userID, fetchLobby,
  setSettings, setIsStarting, onGameStart, message,
}: UseLobbySocketOptions) {
  useEffect(() => {
    if (!lobbyCode || !userID) return;

    const socket = createLobbySocket(
      lobbyCode,
      userID,
      async (event: LobbyEvent) => {
        switch (event.type) {
          case "PLAYER_JOINED":
          case "PLAYER_LEFT":
          case "HOST_CHANGED":
          case "TEAM_UPDATED":
          case "ROLE_UPDATED":
          case "STATUS_UPDATED":
            await fetchLobby();
            setIsStarting(false);
            if (event.data === "IN_PROGRESS") onGameStart();
            break;

          case "SETTINGS_UPDATED": {
            const d = event.data as SettingsUpdateData;
            setSettings((prev) => ({
              ...prev,
              spymasterTimer: d.spymasterTimeLimit ?? null,
              spyTimer: d.spyTimeLimit ?? null,
              roundsNumber: d.rounds,
            }));
            message.info("Game settings updated by the host.");
            break;
          }
        }
      }
    );

    socket.connect();
    return () => {socket.disconnect()};
  }, [lobbyCode, userID]);
}