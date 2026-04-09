import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { User } from "@/types/user";

export interface GameEvent<T = unknown> {
  type: string;
  lobbyCode: string;
  board: T | null;
}

export function createGameSocket(
  lobbyCode: string,
  role: User["role"],
  onMessage: (event: GameEvent) => void
) {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
    reconnectDelay: 5000,
  });

  let subscription: StompSubscription | null = null;

  client.onConnect = () => {
    let topic = "";

    if (role === "spymaster") {
      topic = `/topic/game/${lobbyCode}/spymaster`;
    } else if (role === "spy") {
      topic = `/topic/game/${lobbyCode}/spy`;
    } else {
      console.error("Cannot subscribe to game websocket. Role is null or invalid.");
      return;
    }

    subscription = client.subscribe(topic, (message: IMessage) => {
      const event: GameEvent = JSON.parse(message.body);
      onMessage(event);
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
      if (subscription !== null) {
        subscription.unsubscribe();
      }
      await client.deactivate();
    },
  };
}
