import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { GameEvent, GuessEvent, ClueEvent, ClueReportedEvent, ClueRulingEvent, TurnChangedEvent } from "@/types/gameEvent";
import { getApiDomain } from "./domain";

export function createGameSocket(
  lobbyCode: string,
  role: "SPYMASTER" | "SPY",
  onMessage: (event: GameEvent) => void
) {

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${getApiDomain()}/ws`),
      // new SockJS(`https://sopra-fs26-group-25-server.oa.r.appspot.com/ws`),
    reconnectDelay: 5000,
  });

  // sometimtes needed (more in testing) --> if an action happens rather quickly it can happen that the connection isnt established yet (1-2 sec after game start)
  const waitForConnection = (fn: () => void, retries = 10) => {
    console.log("waitForConnection called, connected:", client.connected, "retries:", retries);
    if (client.connected) {
      console.log("Connected! Calling fn...");
      fn();
    } else if (retries > 0) {
      console.log("Not connected, retrying...");
      setTimeout(() => waitForConnection(fn, retries - 1), 200);
    } else {
      console.error("STOMP still not connected after retries");
    }
  };

  let subscription: StompSubscription | null = null;

  client.onConnect = () => {
    const topic =
      role === "SPYMASTER"
        ? `/topic/game/${lobbyCode}/spymaster`
        : `/topic/game/${lobbyCode}/spy`;

    subscription = client.subscribe(topic, (message: IMessage) => {
      const event: GameEvent = JSON.parse(message.body);
      console.log("Game event received:", event);
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

    isConnected: () => client.connected, 

    sendGuess: (event: GuessEvent) => {
      waitForConnection(() => {
        client.publish({
          destination: `/app/${lobbyCode}/guess`,
          body: JSON.stringify({word: event.guessedCard.word}),
        })
      });
    },

    sendClue: (event: ClueEvent) => {
      waitForConnection(() => {
        client.publish({
          destination: `/app/${lobbyCode}/clue`,
          body: JSON.stringify(event),
        });
      });
    },

    sendClueReport: (event: ClueReportedEvent) => {
      waitForConnection(() => {
        client.publish({
            destination: `/app/${lobbyCode}/clue-report`,
            body: JSON.stringify(event),
        });
      });
    },

    sendClueRuling: (event: ClueRulingEvent) => {
      waitForConnection(() => {
        client.publish({
            destination: `/app/${lobbyCode}/clue-ruling`,
            body: JSON.stringify(event),
        });
      });
    },

    sendTurnChange: (event: TurnChangedEvent) => {
      waitForConnection(() => {
        client.publish({
            destination: `/app/${lobbyCode}/turn-change`,
            body: JSON.stringify(event),
        });
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
