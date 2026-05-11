import { useEffect, useRef } from "react";
import {
  createLobbySocket,
  JoinRequestData,
  LobbyEvent,
  SettingsUpdateData,
} from "@/utils/lobbyWebsocket";
import { BackendLobbySettings } from "@/types/lobby";
import type { MessageInstance } from "antd/es/message/interface";

interface UseLobbySocketOptions {
  lobbyCode: string;
  userID: number | null;
  fetchLobby: () => Promise<unknown>;
  applySettingsFromBackend: (settings: BackendLobbySettings) => void;
  setIsStarting: (val: boolean) => void;
  isHost: boolean;
  onCurrentPlayerRemoved: (messageText?: string) => void;
  onGameStart: () => void;
  onJoinRequest: (request: JoinRequestData) => void;
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
          case "PLAYER_KICKED": {
            const kickedId = Number(event.data);
            if (kickedId === o.userID) {
              o.onCurrentPlayerRemoved("You have been kicked from the lobby.");
              return;
            }
            await o.fetchLobby();
            break;
          }

          case "PLAYER_LEFT": {
            const leftId = Number(event.data);
            if (leftId === o.userID) {
              o.onCurrentPlayerRemoved();
              return;
            }
            await o.fetchLobby();
            break;
          }

          case "PLAYER_JOINED":
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
            o.applySettingsFromBackend({
              spymasterTimeLimit: d.spymasterTimeLimit ?? null,
              spyTimeLimit: d.spyTimeLimit ?? null,
              rounds: d.rounds,
              topics: d.topics,
            });
            await o.fetchLobby();
            o.message.info("Game settings updated by the host.");
            break;
          }

          case "JOIN_REQUEST_RECEIVED":
            if (o.isHost) {
              o.onJoinRequest(event.data as JoinRequestData);
            }
            break;
        }
      }
    );

    socket.connect();
    return () => { void socket.disconnect(); };
  }, [opts.lobbyCode, opts.userID]);
}
