"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { GameEvent, GuessEvent, ClueEvent } from "@/types/gameEvent";
import { createGameSocket } from "@/utils/gameWebsocket";
import styles from "@/styles/game.module.css";

export default function GamePage() {
  const apiService = useApi();
  const {lobbyCode} = useParams();
  const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);


  const [currentPlayer, setCurrentPlayer] = useState<User | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [role, setRole] = useState<User["role"] | null>(null);
  const [board, setBoard] = useState<WordCard[]>([]);
  const [loadingRole, setLoadingRole] = useState(true);
  const [currentTurn, setCurrentTurn] = useState<"red" | "blue">("red");
  const teamClass = currentTurn === "red" ? styles.redTeam : styles.blueTeam;


  // fetch players as a helper function
  const fetchPlayers = async () => {
    try {
      const data = await apiService.get<User[]>(`/lobbies/${lobbyCode}/players`);
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players!");
    }
  };

  const fetchBoard = async () => {
    try {
      const data = await apiService.get<WordCard[]>(`/games/${lobbyCode}/board`);
      setBoard(data);
    } catch (error) {
      console.error("Failed to fetch board!");
    }
  };

  // fetch player and board on startup
  useEffect(() => {
    if (!lobbyCode) return;
    fetchPlayers();
    fetchBoard();
  }, [apiService, lobbyCode]);


  // fetch user role
  useEffect(() => {
    if (!lobbyCode) return;

    const storedPlayerId = localStorage.getItem(`playerId_${lobbyCode}`);

    if (!storedPlayerId) {
      console.error("No player ID found in localStorage");
      setLoadingRole(false);
      return;
    }

    if (players.length === 0) {
      return;
    }

    const currentPlayer = players.find(
      (player) => String(player.id) === String(storedPlayerId)
    );

    if (!currentPlayer) {
      console.error("Current player not found in lobby");
      setLoadingRole(false);
      return;
    }

    setRole(currentPlayer.role);
    setCurrentPlayer(currentPlayer);
    setLoadingRole(false);
  }, [players, lobbyCode]);


  // subscribe to game websocket
  useEffect(() => {
    if (!lobbyCode) return;

    const socket = createGameSocket(String(lobbyCode), (event) => {
      console.log("Game event received: ", event);

      switch(event.type){
        case "Clue": break;
        case "Guess": {fetchBoard(); break;}
        default: break;
      }
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [lobbyCode]);


  // mock board
  useEffect(() => {
    const cards: WordCard[] = [
      { word: "Apple", cardType: "CIVILIAN", revealed: false },
      { word: "River", cardType: "AGENTBLUE", revealed: true },
      { word: "Castle", cardType: "AGENTRED", revealed: false },
      { word: "Moon", cardType: "ASSASSIN", revealed: true },
      { word: "Tiger", cardType: "CIVILIAN", revealed: false },
      { word: "Glass", cardType: "AGENTBLUE", revealed: false },
      { word: "Train", cardType: "AGENTRED", revealed: true },
      { word: "Cloud", cardType: "CIVILIAN", revealed: false },
      { word: "Chair", cardType: "AGENTBLUE", revealed: false },
      { word: "Book", cardType: "AGENTRED", revealed: false },
      { word: "Bridge", cardType: "CIVILIAN", revealed: false },
      { word: "Whale", cardType: "AGENTBLUE", revealed: false },
      { word: "Snow", cardType: "AGENTRED", revealed: false },
      { word: "Clock", cardType: "CIVILIAN", revealed: true },
      { word: "Piano", cardType: "AGENTBLUE", revealed: false },
      { word: "Bread", cardType: "AGENTRED", revealed: false },
      { word: "Forest", cardType: "CIVILIAN", revealed: false },
      { word: "Bottle", cardType: "AGENTBLUE", revealed: false },
      { word: "Star", cardType: "AGENTRED", revealed: false },
      { word: "Window", cardType: "CIVILIAN", revealed: false },
      { word: "Rocket", cardType: "AGENTBLUE", revealed: true },
      { word: "Lamp", cardType: "AGENTRED", revealed: false },
      { word: "Beach", cardType: "CIVILIAN", revealed: false },
      { word: "Ring", cardType: "AGENTBLUE", revealed: false },
      { word: "Tower", cardType: "AGENTRED", revealed: false },
    ];
    setBoard(cards);
  }, []);

  const getCardClass = (card: WordCard) => {
    if (!card.revealed) return `${styles.card} ${styles.clickableCard}`;

    switch (card.cardType) {
      case "CIVILIAN":
        return `${styles.card} ${styles.cardCivilian}`;
      case "AGENTBLUE":
        return `${styles.card} ${styles.cardBlueAgent}`;
      case "AGENTRED":
        return `${styles.card} ${styles.cardRedAgent}`;
      case "ASSASSIN":
        return `${styles.card} ${styles.cardAssassin}`;
      default:
        return styles.card;
    }
  };

  const handleCardClick = (card: WordCard, index: number) => {
    if (card.revealed) return;

    const storedPlayerId = localStorage.getItem(`playerId_${lobbyCode}`);
    if (!storedPlayerId) return;

    const currentPlayer = players.find(
      (player) => String(player.id) === String(storedPlayerId)
    );

    if (!currentPlayer) {
      console.error("Could not find current player");
      return;
    }

    const guessEvent: GuessEvent = {
      type: "Guess",
      timeStamp: new Date().toISOString(),
      player: currentPlayer,
      description: `${currentPlayer.username} guessed ${card.word}`,
      guessedCard: card,
    };

    if (socketRef.current) {
      socketRef.current.sendGuess(guessEvent);
    }
  };

  const handlePause = () => {
    console.log("Pause!")
  }

  const handleEnd = () => {
    console.log("End!");
  };


  return (
    <div className={`${styles.page} ${teamClass}`}>
      <div className={styles.boardArea}>
        {(currentPlayer?.isHost || true) && (
        <div className={styles.topButtonsRow}>
          <div className={styles.topButtons}>
            <button className={styles.topActionButton} onClick={handlePause}>
              {"\u23F8"}
            </button>

            <button
              className={styles.topActionButton}
              onClick={handleEnd}
            >
              <span className={styles.buttonLabel}>End</span>
            </button>
          </div>
        </div>
        )}
        <div className={styles.board}>
          {board.map((card, index) => (
            <div
              key={index}
              className={getCardClass(card)}
              onClick={() => handleCardClick(card, index)}
            >
              <span className={styles.cardWord}>{card.word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
