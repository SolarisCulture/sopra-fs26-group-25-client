import { useEffect, useRef } from "react";
import {
  createLobbySocket,
  LobbyEvent,
  SettingsUpdateData,
} from "@/utils/lobbyWebsocket";
import { LobbySettings } from "@/types/lobby";
import type { MessageInstance } from "antd/es/message/interface";

interface UseLobbySocketOptions {
  lobbyCode: string;
  userID: number | null;
  fetchLobby: () => Promise<unknown>;
  setSettings: (fn: (prev: LobbySettings) => LobbySettings) => void;
  setIsStarting: (val: boolean) => void;
  onGameStart: () => void;
  message: MessageInstance;
}

export function useLobbyWebSocket(opts: UseLobbySocketOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!optsRef.current.lobbyCode || !optsRef.current.userID) return;

    const socket = createLobbySocket(
      optsRef.current.lobbyCode,
      optsRef.current.userID,
      async (event: LobbyEvent) => {
        const o = optsRef.current;
        switch (event.type) {
          case "PLAYER_JOINED":
          case "PLAYER_LEFT":
          case "HOST_CHANGED":
          case "TEAM_UPDATED":
          case "ROLE_UPDATED":
          case "STATUS_UPDATED":
            await o.fetchLobby();
            o.setIsStarting(false);
            if (event.data === "IN_PROGRESS") o.onGameStart();
            break;

          case "SETTINGS_UPDATED": {
            const d = event.data as SettingsUpdateData;
            o.setSettings((prev) => ({
              ...prev,
              spymasterTimer: d.spymasterTimeLimit ?? null,
              spyTimer: d.spyTimeLimit ?? null,
              roundsNumber: d.rounds,
            }));
            o.message.info("Game settings updated by the host.");
            break;
          }
        }
      }
    );

    socket.connect();
    return () => { void socket.disconnect(); };
  }, [opts.lobbyCode, opts.userID]);
}