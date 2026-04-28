import { useEffect, useRef } from "react";
import { createGameSocket } from "@/utils/gameWebsocket";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";

interface GameSocketOptions {
  lobbyCode: string;
  role: User["role"] | null;
  currentTurnRef: React.MutableRefObject<"red" | "blue">;
  setBoard: (cards: WordCard[]) => void;
  setCurrentPhase: (phase: string) => void;
  setCurrentTurn: (turn: "red" | "blue") => void;
  setGameId: (id: number) => void;
  setFinished: (val: boolean) => void;
  setCurrentClue: (clue: { word: string; count: number } | null) => void;
  setCluePublished: (val: boolean) => void;
  setClueHistory: React.Dispatch<React.SetStateAction<{ word: string; count: number; team: "red" | "blue" }[]>>;
  setClueReviewOpen: (val: boolean) => void;
  setPenaltyPickMode: (val: boolean) => void;
  setWinningTeam: (team: string | null) => void;
  fetchBoard: () => Promise<any>;
  fetchPlayers: () => Promise<void>;
  fetchGameStatistics: () => Promise<void>;
  onReturnToLobby: () => void;
  message: any;
}

export function useGameSocket(opts: GameSocketOptions) {
  const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);

  useEffect(() => {
    if (!opts.lobbyCode || !opts.role || opts.role === "NONE") return;
    if (socketRef.current) return;

    const socket = createGameSocket(
      opts.lobbyCode,
      opts.role,
      (event) => {
        switch (event.type) {
          case "Clue":
            opts.setCurrentPhase(event.board.currentPhase);
            opts.setCurrentClue({ word: event.board.clueWord ?? "", count: event.board.clueCount });
            opts.setClueHistory(prev => [{
              word: event.board.clueWord ?? "",
              count: event.board.clueCount,
              team: opts.currentTurnRef.current,
            }, ...prev]);
            opts.setCluePublished(true);
            opts.setBoard(event.board.cards);
            opts.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            break;
          case "Guess":
            opts.setBoard(event.board.cards);
            opts.setCurrentPhase(event.board.currentPhase);
            opts.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            break;
          case "ClueReported":
            opts.setClueReviewOpen(true);
            break;
          case "ClueApproved":
            opts.setClueReviewOpen(false);
            opts.message.success("Clue approved!");
            break;
          case "ClueRuledInvalid":
            opts.setClueReviewOpen(false);
            opts.setClueHistory(prev => prev.slice(1));
            opts.setCurrentClue(null);
            opts.setCluePublished(false);
            opts.setPenaltyPickMode(true);
            opts.message.warning("Clue ruled invalid!");
            break;
          case "TurnChanged":
            opts.setCurrentPhase(event.board.currentPhase);
            opts.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            opts.setCluePublished(false);
            opts.setCurrentClue(null);
            opts.setBoard(event.board.cards);
            break;
          case "GameOver":
            opts.fetchBoard();
            opts.setFinished(true);
            opts.fetchGameStatistics();
            break;
          case "ReturningToLobby":
            opts.setWinningTeam(null);
            socketRef.current?.disconnect();
            opts.onReturnToLobby();
            break;
          case "GameRestarting":
            opts.setWinningTeam(null);
            if (event.board) {
              opts.setGameId(event.board.id);
              opts.setBoard(event.board.cards);
              opts.setCurrentPhase(event.board.currentPhase);
              opts.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            }
            break;
        }
      },
      () => {
        opts.fetchBoard();
        opts.fetchPlayers();
      }
    );

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [opts.lobbyCode, opts.role]);

  return socketRef;
}