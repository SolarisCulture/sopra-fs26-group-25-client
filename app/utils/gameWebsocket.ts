import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { GameEvent, GuessEvent, ClueEvent, ClueReportedEvent, TurnChangedEvent, ClueApprovedEvent, ClueRuledInvalidEvent, ReportedGuessEvent, ChatEvent } from "@/types/gameEvent";
import { getApiDomain } from "./domain";
import { ChatMessagePayload } from "@/types/chatMessagePayload";

export function createGameSocket(
  lobbyCode: string,
  role: "SPYMASTER" | "SPY",
  playerId: number | null,
  onMessage: (event: GameEvent) => void,
  onReconnect: () => void,
  ) {

  let isSubscribed = false;

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${getApiDomain()}/ws`),
      // new SockJS(`https://sopra-fs26-group-25-server.oa.r.appspot.com/ws`),
    reconnectDelay: 5000,
  });

  // sometimtes needed (more in testing) --> if an action happens rather quickly it can happen that the connection isnt established yet (1-2 sec after game start)
  const waitForConnection = (fn: () => void, retries = 10) => {
    console.log("waitForConnection called, connected:", client.connected,"subscribed: ", isSubscribed, "retries:", retries);
    if (client.connected && isSubscribed) {
      console.log("The connection is there! Calling fn...");
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
    console.log("STOMP CONNECTED / RECONNECTED")

    const topic =
      role === "SPYMASTER"
        ? `/topic/game/${lobbyCode}/spymaster`
        : `/topic/game/${lobbyCode}/spy`;

    subscription = client.subscribe(topic, (message: IMessage) => {
      const parsed = JSON.parse(message.body);
      const event: GameEvent = typeof parsed === "number"
        ? { type: "TIMER_UPDATE", lobbyCode, timer: parsed }
        : parsed;
      console.log("Game event received:", event);
      onMessage(event);
    });

    client.publish({
      destination: `/app/${lobbyCode}/game-subscribe`,
      body: JSON.stringify({
        type: "SUBSCRIBE",
        lobbyCode,
        data: playerId ? { id: playerId } : null,
      }),
    });

  console.log("Reconnected → resyncing state");
    isSubscribed = true;
    onReconnect();
  };

  client.onDisconnect = () => {
    console.log("STOMP DISCONNECTED");
    isSubscribed = false;
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
          body: JSON.stringify({word: event.word, count: event.count}),
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

    sendClueApproved: (event: ClueApprovedEvent) => {
      waitForConnection(() => {
        client.publish({
            destination: `/app/${lobbyCode}/clue-approved`,
            body: JSON.stringify(event),
        });
      });
    },

    sendClueRuledInvalid: (event: ClueRuledInvalidEvent) => {
      waitForConnection(() => {
        client.publish({
            destination: `/app/${lobbyCode}/clue-ruled-invalid`,
            body: JSON.stringify(event),
        });
      });
    },

    sendReportedGuess: (event: ReportedGuessEvent) => {
      waitForConnection(() => {
        client.publish({
          destination: `/app/${lobbyCode}/reported-guess`,
          body: JSON.stringify({word: event.guessedCard.word}),
        })
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

    sendChatMessage: (payload: ChatMessagePayload) => {
      waitForConnection(() => {
        client.publish({
          destination: `/app/${lobbyCode}/chat`,
          body: JSON.stringify(payload),
        });
      });
    },

    sendPause: (isPaused: boolean) => {
      waitForConnection(() => {
        client.publish({
          destination: `/app/${lobbyCode}/pause`,
          body: JSON.stringify({ paused: isPaused }),
        });
      });
    },

    disconnect: async () => {
      if (subscription !== null) {
        subscription.unsubscribe();
      }
      isSubscribed = false;
      await client.deactivate();
    },
  };
}
