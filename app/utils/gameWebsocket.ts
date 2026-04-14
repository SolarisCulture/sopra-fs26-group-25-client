import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { GameEvent, GuessEvent, ClueEvent, ClueReportedEvent, ClueRulingEvent, TurnChangedEvent } from "@/types/gameEvent";

export function createGameSocket(
  lobbyCode: string,
  onMessage: (event: GameEvent) => void
) {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
    reconnectDelay: 5000,
  });

  let subscription: StompSubscription | null = null;

  client.onConnect = () => {
    subscription = client.subscribe(
      `/topic/game/${lobbyCode}/events`,
      (message: IMessage) => {
        const event: GameEvent = JSON.parse(message.body);
        onMessage(event);
      }
    );
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
    sendGuess: (event: GuessEvent) => {
      client.publish({
        destination: `/app/${lobbyCode}/guess`,
        body: JSON.stringify(event),
      })
    },

    sendClue: (event: ClueEvent) => {
      client.publish({
        destination: `/app/${lobbyCode}/clue`,
        body: JSON.stringify(event),
      });
    },

    sendClueReport: (event: ClueReportedEvent) => {
      client.publish({
          destination: `/app/${lobbyCode}/clue-report`,
          body: JSON.stringify(event),
      });
    },

    sendClueRuling: (event: ClueRulingEvent) => {
      client.publish({
          destination: `/app/${lobbyCode}/clue-ruling`,
          body: JSON.stringify(event),
      });
    },

  sendTurnChange: (event: TurnChangedEvent) => {
      client.publish({
          destination: `/app/${lobbyCode}/turn-change`,
          body: JSON.stringify(event),
      });
  },

    disconnect: async () => {
      if (subscription !== null) {
        subscription.unsubscribe();
      }
      await client.deactivate();
    },
  };
}
