import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "./domain";
export type LobbyStatus = "IN_PROGRESS" | "WAITING" | "FINISHED";

export interface LobbyEvent {
  type:
    | "LOBBY_CREATED"
    | "PLAYER_JOINED"
    | "PLAYER_LEFT"
    | "HOST_CHANGED"
    | "TEAM_UPDATED"
    | "ROLE_UPDATED"
    | "STATUS_UPDATED"
    | "SETTINGS_UPDATED";
  lobbyCode: string;
  data: any; // string | number | boolean | null
  timestamp: string;
}

export function createLobbySocket(
  lobbyCode: string,
  playerId: number | null,
  onMessage: (event: LobbyEvent) => void
) {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${getApiDomain()}/ws`),
    reconnectDelay: 5000,
  });

  let subscription: StompSubscription | null = null;

  client.onConnect = () => {
    subscription = client.subscribe(`/topic/lobbies/${lobbyCode}`, (message: IMessage) => {
      const event = JSON.parse(message.body);
      onMessage(event);
    });

    client.publish({
      destination: `/app/lobby/${lobbyCode}/subscribe`,
      body: JSON.stringify({
        type: "SUBSCRIBE",
        lobbyCode,
        data: playerId ? { id: playerId } : null,
      }),
    });
  };

  client.onStompError = (frame) => {
    console.error("Broker error:", frame.headers["message"]);
    console.error(frame.body);
  };

  client.onWebSocketError = (error) => {
    console.error("WebSocket error:", error);
  };

  return {
    connect: () => client.activate(),
    disconnect: async () => {
      subscription?.unsubscribe();
      await client.deactivate();
    },
  };
}
